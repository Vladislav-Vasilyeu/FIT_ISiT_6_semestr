#include <winsock2.h>
#include <ws2tcpip.h>
#include <iostream>
#include <string>
#include <cstring>

#pragma comment(lib, "Ws2_32.lib")

int main() {
	setlocale(LC_ALL, "Russian");
    WSADATA wsaData;
    if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
        std::cerr << "WSAStartup failed\n";
        return 1;
    }

    SOCKET sockfd = socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP);
    if (sockfd == INVALID_SOCKET) {
        std::cerr << "socket() failed: " << WSAGetLastError() << std::endl;
        WSACleanup();
        return 1;
    }

    sockaddr_in servaddr;
    ZeroMemory(&servaddr, sizeof(servaddr));
    servaddr.sin_family = AF_INET;
    servaddr.sin_port = htons(6000); 

    if (inet_pton(AF_INET, "127.0.0.1", &servaddr.sin_addr) != 1) {
        std::cerr << "inet_pton() failed\n";
        closesocket(sockfd);
        WSACleanup();
        return 1;
    }

    std::cout << "[13-18] UDP Client (C++) запущен" << std::endl;

    const char* messages[] = {
        "Привет от C++ UDP клиента!",
        "Сообщение из лабораторной 13",
        "Тестирование UDP",
        "Последнее сообщение"
    };

    char buffer[1024];
    sockaddr_in fromAddr;
    int fromLen = sizeof(fromAddr);

    for (const char* msg : messages) {
        int msgLen = static_cast<int>(std::strlen(msg));
        if (sendto(sockfd, msg, msgLen, 0, reinterpret_cast<sockaddr*>(&servaddr), static_cast<int>(sizeof(servaddr))) == SOCKET_ERROR) {
            std::cerr << "sendto() failed: " << WSAGetLastError() << std::endl;
            break;
        }

        std::cout << "[13-18] → Отправлено: " << msg << std::endl;

        int n = recvfrom(sockfd, buffer, static_cast<int>(sizeof(buffer) - 1), 0, reinterpret_cast<sockaddr*>(&fromAddr), &fromLen);
        if (n == SOCKET_ERROR) {
            std::cerr << "recvfrom() failed: " << WSAGetLastError() << std::endl;
            break;
        }
        if (n <= 0) continue;

        buffer[n] = '\0';
        std::cout << "[13-18] ← Ответ: " << buffer << std::endl;

        Sleep(1000); // миллисекунды
    }

    closesocket(sockfd);
    WSACleanup();
    std::cout << "[13-18] Клиент завершил работу" << std::endl;
    return 0;
}