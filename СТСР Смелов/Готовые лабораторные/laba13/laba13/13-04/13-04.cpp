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

    SOCKET sock = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (sock == INVALID_SOCKET) {
        std::cerr << "socket() failed: " << WSAGetLastError() << '\n';
        WSACleanup();
        return 1;
    }

    sockaddr_in serv_addr;
    ZeroMemory(&serv_addr, sizeof(serv_addr));
    serv_addr.sin_family = AF_INET;
    serv_addr.sin_port = htons(3000);

    if (inet_pton(AF_INET, "127.0.0.1", &serv_addr.sin_addr) != 1) {
        std::cerr << "inet_pton() failed\n";
        closesocket(sock);
        WSACleanup();
        return 1;
    }

    if (connect(sock, reinterpret_cast<sockaddr*>(&serv_addr), static_cast<int>(sizeof(serv_addr))) == SOCKET_ERROR) {
        std::cerr << "connect() failed: " << WSAGetLastError() << '\n';
        closesocket(sock);
        WSACleanup();
        return 1;
    }

    std::cout << "[C++] Подключено к Node.js серверу 13-01\n";

    const char* messages[] = { "Привет от C++ клиента!", "Тест 123", "Лабораторная работа 13", "Завершение" };
    char buffer[1024];

    for (auto msg : messages) {
        int sendLen = static_cast<int>(std::strlen(msg));
        if (send(sock, msg, sendLen, 0) == SOCKET_ERROR) {
            std::cerr << "send() failed: " << WSAGetLastError() << '\n';
            break;
        }
        std::cout << "[C++] Отправлено: " << msg << std::endl;

        int valread = recv(sock, buffer, static_cast<int>(sizeof(buffer) - 1), 0);
        if (valread <= 0) {
            std::cerr << "[C++] recv() failed или соединение закрыто\n";
            break;
        }
        buffer[valread] = '\0';
        std::cout << "[C++] Ответ: " << buffer << std::endl;

        Sleep(1000); // миллисекунды
    }

    closesocket(sock);
    WSACleanup();
    return 0;
}