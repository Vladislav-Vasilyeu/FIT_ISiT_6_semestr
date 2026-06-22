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
        std::cerr << "Ошибка создания сокета: " << WSAGetLastError() << std::endl;
        WSACleanup();
        return 1;
    }

    sockaddr_in servaddr;
    ZeroMemory(&servaddr, sizeof(servaddr));
    servaddr.sin_family = AF_INET;
    servaddr.sin_addr.s_addr = INADDR_ANY;
    servaddr.sin_port = htons(6000);  // Порт 6001 для C++ сервера

    if (bind(sockfd, reinterpret_cast<sockaddr*>(&servaddr), static_cast<int>(sizeof(servaddr))) == SOCKET_ERROR) {
        std::cerr << "Ошибка привязки сокета: " << WSAGetLastError() << std::endl;
        closesocket(sockfd);
        WSACleanup();
        return 1;
    }

    std::cout << "[13-17] UDP Echo Server (C++) запущен на порту 6001" << std::endl;

    char buffer[1024];
    sockaddr_in cliaddr;
    int cliLen = static_cast<int>(sizeof(cliaddr));

    while (true) {
        ZeroMemory(&cliaddr, sizeof(cliaddr));
        int n = recvfrom(sockfd, buffer, static_cast<int>(sizeof(buffer) - 1), 0,
                         reinterpret_cast<sockaddr*>(&cliaddr), &cliLen);
        if (n == SOCKET_ERROR) {
            std::cerr << "recvfrom() failed: " << WSAGetLastError() << std::endl;
            break;
        }
        if (n <= 0) continue;

        buffer[n] = '\0';

        char addrStr[INET_ADDRSTRLEN] = {0};
        inet_ntop(AF_INET, &cliaddr.sin_addr, addrStr, INET_ADDRSTRLEN);

        std::cout << "[13-17] Получено от "
                  << addrStr << ":"
                  << ntohs(cliaddr.sin_port)
                  << " → \"" << buffer << "\"" << std::endl;

        std::string response = "ECHO: ";
        response.append(buffer, buffer + n);

        if (sendto(sockfd, response.c_str(), static_cast<int>(response.length()), 0,
                   reinterpret_cast<sockaddr*>(&cliaddr), cliLen) == SOCKET_ERROR) {
            std::cerr << "sendto() failed: " << WSAGetLastError() << std::endl;
            break;
        }

        std::cout << "[13-17] Отправлен ответ: \"" << response << "\"" << std::endl;
    }

    closesocket(sockfd);
    WSACleanup();
    return 0;
}