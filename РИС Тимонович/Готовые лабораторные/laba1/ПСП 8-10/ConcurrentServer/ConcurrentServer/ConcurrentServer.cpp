#include "stdafx.h"
#include <ws2tcpip.h>
#include "Winsock2.h"
#include "ErrorFunctions.h"
#include <string>
#include <list>
#include <time.h>
#include <iostream>
#define _CRT_SECURE_NO_WARNINGS
#define AS_SQ 10
#define IP_SERVER "127.0.0.1"
const char* ucall = "Hello";
using namespace std;
#ifndef MSG_DONTWAIT
#define MSG_DONTWAIT 0x40
#endif
SOCKET sS;
int serverPort;
char dllName[50];
char namedPipeName[10];
volatile long opened = 0;
volatile long connectionCount = 0;
volatile long sayNoCount = 0;
volatile long successConnections = 0;
volatile long currentActiveConnections = 0;
HANDLE hAcceptServer, hConsolePipe, hGarbageCleaner, hDispatchServer, hResponseServer;
HANDLE hClientConnectedEvent = CreateEvent(NULL, FALSE, FALSE, L"ClientConnected");
DWORD WINAPI AcceptServer(LPVOID pPrm);
DWORD WINAPI ConsolePipe(LPVOID pPrm);
DWORD WINAPI GarbageCleaner(LPVOID pPrm);
DWORD WINAPI DispatchServer(LPVOID pPrm);
DWORD WINAPI ResponseServer(LPVOID pPrm);
CRITICAL_SECTION scListContact;

enum TalkersCommand {
    START, STOP, EXIT, STATISTICS, WAIT, SHUTDOWN, GETCOMMAND, LOAD_LIB, UNLOAD_LIB
};
volatile TalkersCommand  previousCommand = GETCOMMAND;

struct Contact
{
    enum TE {
        EMPTY,
        ACCEPT,
        CONTACT
    } type;
    enum ST {
        WORK,
        ABORT,
        TIMEOUT,
        FINISH
    } sthread;
    SOCKET s;
    SOCKADDR_IN prms;
    int lprms;
    HANDLE hthread;
    HANDLE htimer;
    HANDLE serverHThtead;
    char msg[50];
    char srvname[15];
    time_t lastActivityTime;
    int warningsCount;
    Contact(TE t = EMPTY, const char* namesrv = "")
    {
        ZeroMemory(&prms, sizeof(SOCKADDR_IN));
        lprms = sizeof(SOCKADDR_IN);
        type = t;
        strcpy(srvname, namesrv);
        msg[0] = 0x00;
        lastActivityTime = time(NULL);
        warningsCount = 0;
    }
    void SetST(ST sth, const char* m = "")
    {
        sthread = sth;
        strcpy(msg, m);
    }
};
typedef list<Contact> ListContact;
ListContact contacts;
bool  GetRequestFromClient(char* name, short port, SOCKADDR_IN* from, int* flen);

bool AcceptCycle(int sq)
{
    bool rc = false;
    Contact c(Contact::ACCEPT, "EchoServer");
    while (sq-- > 0 && !rc)
    {
        if ((c.s = accept(sS, (sockaddr*)&c.prms, &c.lprms)) == INVALID_SOCKET)
        {
            if (WSAGetLastError() != WSAEWOULDBLOCK)
                throw  SetErrorMsgText("accept:", WSAGetLastError());
        }
        else
        {
            rc = true;
            EnterCriticalSection(&scListContact);
            contacts.push_front(c);
            LeaveCriticalSection(&scListContact);
            puts("contact connected");
            InterlockedIncrement(&connectionCount);
            InterlockedDecrement(&sayNoCount);
        }
    }
    return rc;
}

void openSocket() {
    SOCKADDR_IN serv;
    sockaddr_in clnt;
    u_long nonblk = 1;
    if ((sS = socket(AF_INET, SOCK_STREAM, NULL)) == INVALID_SOCKET)
        throw  SetErrorMsgText("socket:", WSAGetLastError());
    InterlockedIncrement(&opened);
    int lclnt = sizeof(clnt);
    serv.sin_family = AF_INET;
    serv.sin_port = htons(serverPort);
    serv.sin_addr.s_addr = INADDR_ANY;
    if (bind(sS, (LPSOCKADDR)&serv, sizeof(serv)) == SOCKET_ERROR)
        throw  SetErrorMsgText("bind:", WSAGetLastError());
    if (listen(sS, SOMAXCONN) == SOCKET_ERROR)
        throw  SetErrorMsgText("listen:", WSAGetLastError());
    if (ioctlsocket(sS, FIONBIO, &nonblk) == SOCKET_ERROR)
        throw SetErrorMsgText("ioctlsocket:", WSAGetLastError());
}

void closeSocket() {
    if (closesocket(sS) == SOCKET_ERROR)
        throw  SetErrorMsgText("closesocket:", WSAGetLastError());
    InterlockedDecrement(&opened);
}

void CommandsCycle(TalkersCommand& cmd)
{
    int  sq = 0;
    while (cmd != EXIT)
    {
        switch (cmd)
        {
        case START: cmd = GETCOMMAND;
            if (previousCommand != START) {
                sq = AS_SQ;
                puts("Start command");
                openSocket();
                previousCommand = START;
            }
            else puts("start already in use");
            break;
        case STOP:  cmd = GETCOMMAND;
            if (previousCommand != STOP) {
                sq = 0;
                puts("Stop command");
                closeSocket();
                previousCommand = STOP;
            }
            else puts("stop already in use");
            break;
        case WAIT:  cmd = GETCOMMAND;
            sq = 0;
            puts("Wait command\nsocket closed for waiting other clients");
            closeSocket();
            while (contacts.size() != 0);
            printf("size of contacts %d\n", contacts.size());
            cmd = START;
            previousCommand = WAIT;
            puts("socket is open");
            break;
        case SHUTDOWN:
            sq = 0;
            puts("SHUTDOWN command\n........shutting down...........");
            closeSocket();
            while (contacts.size() != 0);
            printf("size of contacts %d\n", contacts.size());
            cmd = EXIT;
            break;
        case GETCOMMAND:  cmd = GETCOMMAND;
            break;
        };
        if (cmd != STOP) {
            if (AcceptCycle(sq))
            {
                cmd = GETCOMMAND;
                SetEvent(hClientConnectedEvent);
            }
            else SleepEx(0, TRUE);
        }
    }
    if (cmd == EXIT) {
        ExitProcess(0);
    }
}

DWORD WINAPI AcceptServer(LPVOID pPrm)
{
    DWORD rc = 0;
    WSADATA wsaData;
    try
    {
        if (WSAStartup(MAKEWORD(2, 0), &wsaData) != 0)
            throw  SetErrorMsgText("Startup:", WSAGetLastError());
        CommandsCycle(*((TalkersCommand*)pPrm));
        if (WSACleanup() == SOCKET_ERROR)
            throw SetErrorMsgText("Cleanup:", WSAGetLastError());
    }
    catch (string errorMsgText)
    {
        printf("\n%s", errorMsgText.c_str());
    }
    puts("shutdown acceptServer");
    ExitThread(rc);
}

TalkersCommand set_param(char* param) {
    if (!strcmp(param, "start")) return START;
    if (!strcmp(param, "stop")) return STOP;
    if (!strcmp(param, "exit")) return EXIT;
    if (!strcmp(param, "wait")) return WAIT;
    if (!strcmp(param, "shutdown")) return SHUTDOWN;
    if (!strcmp(param, "statistics")) return STATISTICS;
    if (!strcmp(param, "getcommand")) return GETCOMMAND;
    if (strstr(param, "UNLOAD_LIB")) return UNLOAD_LIB;
    if (strstr(param, "LOAD_LIB")) return LOAD_LIB;
}

typedef void* (*FUNCTION)(char*, LPVOID);
FUNCTION ts;
volatile bool is_load_library = false;
std::list<HMODULE> list_of_dlls;
std::list<FUNCTION> list_of_functions;

DWORD WINAPI ConsolePipe(LPVOID pPrm)
{
    DWORD rc = 0;
    char rbuf[100];
    DWORD dwRead, dwWrite;
    HANDLE hPipe;
    try
    {
        char namedPipeConnectionString[50];
        sprintf(namedPipeConnectionString, "\\\\.\\pipe\\%s", namedPipeName);
        SECURITY_DESCRIPTOR sd;
        SECURITY_ATTRIBUTES sa;
        InitializeSecurityDescriptor(&sd, SECURITY_DESCRIPTOR_REVISION);
        SetSecurityDescriptorDacl(&sd, TRUE, NULL, FALSE);
        sa.nLength = sizeof(sa);
        sa.lpSecurityDescriptor = &sd;
        sa.bInheritHandle = FALSE;
        if ((hPipe = CreateNamedPipeA(namedPipeConnectionString, PIPE_ACCESS_DUPLEX, PIPE_TYPE_MESSAGE | PIPE_WAIT, 1, NULL, NULL, INFINITE, &sa)) == INVALID_HANDLE_VALUE)
            throw SetPipeError("create:", GetLastError());
        if (!ConnectNamedPipe(hPipe, NULL))
            throw SetPipeError("connect:", GetLastError());
        TalkersCommand& param = *((TalkersCommand*)pPrm);
        while (param != EXIT) {
            puts("Connecting to Named Pipe Client ...");
            ConnectNamedPipe(hPipe, NULL);
            while (ReadFile(hPipe, rbuf, sizeof(rbuf), &dwRead, NULL))
            {
                printf("main client message:  %s\n", rbuf);
                param = set_param(rbuf);
                if (param == LOAD_LIB)
                {
                    is_load_library = true;
                    EnterCriticalSection(&scListContact);
                    list_of_dlls.push_front(LoadLibraryA(strstr(rbuf, "Win")));
                    list_of_functions.push_front((FUNCTION)GetProcAddress(list_of_dlls.front(), "SSS"));
                    LeaveCriticalSection(&scListContact);
                }
                else if (param == UNLOAD_LIB)
                {
                    is_load_library = false;
                    EnterCriticalSection(&scListContact);
                    list_of_dlls.pop_front();
                    list_of_functions.pop_front();
                    LeaveCriticalSection(&scListContact);
                }
                if (param == STATISTICS)
                {
                    char sendStastistics[200];
                    sprintf(sendStastistics, "\nStatistics\ncount of connectings :    %d\ncount of denides:        %d\nsuccess end:             %d\ncount of active connections : %d\n", connectionCount, sayNoCount, successConnections, contacts.size());
                    WriteFile(hPipe, sendStastistics, sizeof(sendStastistics), &dwWrite, NULL);
                }
                if (param != STATISTICS)
                    WriteFile(hPipe, rbuf, strlen(rbuf) + 1, &dwWrite, NULL);
                if (param == EXIT || param == SHUTDOWN) {
                    break;
                }
            }
            DisconnectNamedPipe(hPipe);
            if (param == EXIT || param == SHUTDOWN) {
                break;
            }
        }
    }
    catch (string ErrorPipeText)
    {
        printf("\n%s", ErrorPipeText.c_str());
        return -1;
    }
    CloseHandle(hPipe);
    puts("shutdown ConsolePipe");
    ExitThread(rc);
}

DWORD WINAPI GarbageCleaner(LPVOID pPrm)
{
    DWORD rc = 0;
    while (*((TalkersCommand*)pPrm) != EXIT) {
        int listSize = 0;
        int howMuchClean = 0;
        if (contacts.size() != 0) {
            for (auto i = contacts.begin(); i != contacts.end();) {
                if (i->type == i->EMPTY) {
                    EnterCriticalSection(&scListContact);
                    if (i->sthread == i->FINISH)
                        InterlockedIncrement(&successConnections);
                    if (i->sthread == i->ABORT || i->sthread == i->TIMEOUT)
                        InterlockedIncrement(&sayNoCount);
                    i = contacts.erase(i);
                    howMuchClean++;
                    listSize = contacts.size();
                    LeaveCriticalSection(&scListContact);
                }
                else ++i;
            }
        }
    }
    puts("shutdown garbageCleaner");
    ExitThread(rc);
}

HMODULE st;
void CALLBACK ASWTimer(LPVOID Prm, DWORD, DWORD) {
    Contact* contact = (Contact*)(Prm);
    printf("ASWTimer is calling %p\n", contact->hthread);
    TerminateThread(contact->serverHThtead, NULL);
    send(contact->s, "TimeOUT", strlen("TimeOUT") + 1, NULL);
    EnterCriticalSection(&scListContact);
    CancelWaitableTimer(contact->htimer);
    contact->type = contact->EMPTY;
    contact->sthread = contact->TIMEOUT;
    LeaveCriticalSection(&scListContact);
}

DWORD WINAPI DispatchServer(LPVOID pPrm)
{
    DWORD rc = 0;
    TalkersCommand& command = *(TalkersCommand*)pPrm;
    while (command != EXIT)
    {
        if (command != STOP) {
            WaitForSingleObject(hClientConnectedEvent, INFINITE);
            ResetEvent(hClientConnectedEvent);
            while (true) {
                for (auto i = contacts.begin(); i != contacts.end(); i++) {
                    if (i->type == i->ACCEPT) {
                        char serviceType[10];
                        int r = recv(i->s, serviceType, sizeof(serviceType), NULL);
                        if (r < 1) continue;
                        i->lastActivityTime = time(NULL);
                        i->warningsCount = 0;
                        cout << "New command - " << serviceType << endl;
                        strcpy(i->msg, serviceType);
                        if (!strcmp(i->msg, "close")) {
                            if ((send(i->s, "echo: close", strlen("echo: close") + 1, NULL)) == SOCKET_ERROR)
                                throw  SetErrorMsgText("send:", WSAGetLastError());
                            i->sthread = i->FINISH;
                            i->type = i->EMPTY;
                            continue;
                        }
                        if (!strcmp(i->msg, "exit")) {
                            i->sthread = i->ABORT;
                            i->type = i->EMPTY;
                            continue;
                        }
                        if (strcmp(i->msg, "Echo") && strcmp(i->msg, "Time") && strcmp(i->msg, "Random")) {
                            if ((send(i->s, "ErrorInquiry", strlen("ErrorInquiry") + 1, NULL)) == SOCKET_ERROR)
                                throw  SetErrorMsgText("send:", WSAGetLastError());
                            i->sthread = i->ABORT;
                            i->type = i->EMPTY;
                            if (closesocket(i->s) == SOCKET_ERROR)
                                throw  SetErrorMsgText("closesocket:", WSAGetLastError());
                        }
                        else {
                            i->type = i->CONTACT;
                            i->hthread = hAcceptServer;
                            i->serverHThtead = ts(serviceType, (LPVOID) & (*i));
                            i->htimer = CreateWaitableTimer(0, FALSE, 0);
                            LARGE_INTEGER Li;
                            int seconds = 60;
                            Li.QuadPart = -(10000000 * seconds);
                            SetWaitableTimer(i->htimer, &Li, 0, ASWTimer, (LPVOID) & (*i), FALSE);
                            SleepEx(0, TRUE);
                        }
                    }
                    else if (i->type == i->CONTACT) {
                        char bufCheck[5];
                        int rCheck = recv(i->s, bufCheck, sizeof(bufCheck), MSG_PEEK | MSG_DONTWAIT);
                        if (rCheck > 0) {
                            i->lastActivityTime = time(NULL);
                            i->warningsCount = 0;
                        }
                    }
                }
                Sleep(200);
            }
        }
    }
    puts("shutdown dispatchServer");
    ExitThread(rc);
}

SOCKET sSUDP;
bool PutAnswerToClient(char* name, sockaddr* to, int* lto) {
    char msg[] = "Hello";
    if ((sendto(sSUDP, msg, sizeof(msg) + 1, NULL, to, *lto)) == SOCKET_ERROR)
        throw  SetErrorMsgText("sendto:", WSAGetLastError());
    return false;
}

bool  GetRequestFromClient(char* name, short port, SOCKADDR_IN* from, int* flen)
{
    SOCKADDR_IN clnt;
    int lc = sizeof(clnt);
    ZeroMemory(&clnt, lc);
    char ibuf[500];
    int  lb = 0;
    int optval = 1;
    int TimeOut = 10;
    setsockopt(sSUDP, SOL_SOCKET, SO_BROADCAST, (char*)&optval, sizeof(int));
    setsockopt(sSUDP, SOL_SOCKET, SO_RCVTIMEO, (char*)&TimeOut, sizeof(TimeOut));
    while (true) {
        if ((lb = recvfrom(sSUDP, ibuf, sizeof(ibuf), NULL, (sockaddr*)&clnt, &lc)) == SOCKET_ERROR) return false;
        ibuf[lb] = '\0';
        cout << ibuf << endl;
        if (strcmp(name, ibuf) == 0) {
            *from = clnt;
            *flen = lc;
            return true;
        }
        puts("\nIncorrect callname");
    }
    return false;
}

DWORD WINAPI ResponseServer(LPVOID pPrm)
{
    DWORD rc = 0;
    WSADATA wsaData;
    SOCKADDR_IN serv;
    if (WSAStartup(MAKEWORD(2, 0), &wsaData) != 0)
        throw  SetErrorMsgText("Startup:", WSAGetLastError());
    if ((sSUDP = socket(AF_INET, SOCK_DGRAM, NULL)) == INVALID_SOCKET)
        throw  SetErrorMsgText("socket:", WSAGetLastError());
    serv.sin_family = AF_INET;
    serv.sin_port = htons(serverPort);
    serv.sin_addr.s_addr = INADDR_ANY;
    if (bind(sSUDP, (LPSOCKADDR)&serv, sizeof(serv)) == SOCKET_ERROR)
        throw  SetErrorMsgText("bind:", WSAGetLastError());
    SOCKADDR_IN from;
    int lc = sizeof(from);
    ZeroMemory(&from, lc);
    int numberOfClients = 0;
    char call[50] = "Hello";
    while (*(TalkersCommand*)pPrm != EXIT)
    {
        try
        {
            if (GetRequestFromClient(call, serverPort, &from, &lc))
            {
                if (opened) printf("\nconnected Client: %d, port: %d, address: %s\n", ++numberOfClients, htons(from.sin_port), inet_ntoa(from.sin_addr));
                PutAnswerToClient(call, (sockaddr*)&from, &lc);
                InterlockedIncrement(&sayNoCount);
            }
        }
        catch (string errorMsgText)
        {
            printf("\n%s", errorMsgText.c_str());
        }
    }
    if (closesocket(sSUDP) == SOCKET_ERROR)
        throw  SetErrorMsgText("closesocket:", WSAGetLastError());
    if (WSACleanup() == SOCKET_ERROR)
        throw  SetErrorMsgText("Cleanup:", WSAGetLastError());
    ExitThread(rc);
}

DWORD WINAPI AutoDisconnectThread(LPVOID pPrm)
{
    while (*((TalkersCommand*)pPrm) != EXIT)
    {
        Sleep(1000);
        EnterCriticalSection(&scListContact);
        for (auto i = contacts.begin(); i != contacts.end(); i++)
        {
            if (i->type == i->CONTACT || i->type == i->ACCEPT)
            {
                double idleTime = difftime(time(NULL), i->lastActivityTime);
                if (idleTime >= 180.0)
                {
                    printf("AutoDisconnect: client %d is disconnected due to inactivity\n", i->s);
                    closesocket(i->s);
                    i->sthread = i->ABORT;
                    i->type = i->EMPTY;
                }
                else
                {
                    int newWarnings = (int)(idleTime / 18.0);
                    if (newWarnings > i->warningsCount)
                    {
                        i->warningsCount = newWarnings;
                        printf("Warning %d for client %d due to inactivity\n", i->warningsCount, i->s);
                        if (i->warningsCount >= 10)
                        {
                            printf("AutoDisconnect: client %d is forcibly disconnected. Too many warnings.\n", i->s);
                            closesocket(i->s);
                            i->sthread = i->ABORT;
                            i->type = i->EMPTY;
                        }
                    }
                }
            }
        }
        LeaveCriticalSection(&scListContact);
    }
    puts("shutdown AutoDisconnectThread");
    ExitThread(0);
}

int main(int argc, char* argv[])
{
    setlocale(LC_ALL, "rus");
    if (argc == 2) {
        serverPort = atoi(argv[1]);
    }
    else if (argc == 3) {
        serverPort = atoi(argv[1]);
        strcpy(dllName, argv[2]);
    }
    else if (argc == 4) {
        serverPort = atoi(argv[1]);
        strcpy(dllName, argv[2]);
        strcpy(namedPipeName, argv[3]);
    }
    else {
        serverPort = 2000;
        strcpy(dllName, "ServiceLibrary.dll");
        strcpy(namedPipeName, "BOX");
    }
    printf("server port %d\n", serverPort);

    st = LoadLibraryA(dllName);
    if (st == NULL) {
        printf("Не удалось загрузить DLL: %s. Ошибка: %d\n", dllName, GetLastError());
        return -1;
    }

    ts = (FUNCTION)GetProcAddress(st, "SSS");
    if (ts == NULL) {
        printf("Не удалось найти функцию SSS в DLL: %s. Ошибка: %d\n", dllName, GetLastError());
        FreeLibrary(st);
        return -1;
    }

    volatile TalkersCommand cmd = STOP;
    InitializeCriticalSection(&scListContact);

    // Создание потоков
    hAcceptServer = CreateThread(NULL, 0, AcceptServer, (LPVOID)&cmd, 0, NULL);
    hConsolePipe = CreateThread(NULL, 0, ConsolePipe, (LPVOID)&cmd, 0, NULL);
    hGarbageCleaner = CreateThread(NULL, 0, GarbageCleaner, (LPVOID)&cmd, 0, NULL);
    hDispatchServer = CreateThread(NULL, 0, DispatchServer, (LPVOID)&cmd, 0, NULL);
    hResponseServer = CreateThread(NULL, 0, ResponseServer, (LPVOID)&cmd, 0, NULL);
    HANDLE hAutoDisconnect = CreateThread(NULL, 0, AutoDisconnectThread, (LPVOID)&cmd, 0, NULL);

    // Установка приоритетов потоков
    SetThreadPriority(hGarbageCleaner, THREAD_PRIORITY_BELOW_NORMAL);
    SetThreadPriority(hDispatchServer, THREAD_PRIORITY_NORMAL);
    SetThreadPriority(hConsolePipe, THREAD_PRIORITY_NORMAL);
    SetThreadPriority(hResponseServer, THREAD_PRIORITY_NORMAL);
    SetThreadPriority(hAcceptServer, THREAD_PRIORITY_HIGHEST);

    // Ожидание завершения потоков
    WaitForSingleObject(hAcceptServer, INFINITE);
    CloseHandle(hAcceptServer);
    WaitForSingleObject(hConsolePipe, INFINITE);
    CloseHandle(hConsolePipe);
    WaitForSingleObject(hGarbageCleaner, INFINITE);
    CloseHandle(hGarbageCleaner);
    TerminateThread(hDispatchServer, 0);
    puts("shutdown dispatchServer");
    TerminateThread(hResponseServer, 0);
    puts("shutdown responseServer");
    TerminateThread(hAutoDisconnect, 0);
    puts("shutdown AutoDisconnectThread");
    CloseHandle(hDispatchServer);
    CloseHandle(hResponseServer);
    CloseHandle(hAutoDisconnect);

    DeleteCriticalSection(&scListContact);
    FreeLibrary(st);
    return 0;
}