#include <winsock2.h>
#include <ws2tcpip.h>
#include <iostream>
#include <string>

#pragma comment(lib, "Ws2_32.lib")

int main() {
	setlocale(LC_ALL, "Russian");
    WSADATA wsaData;
    if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
        std::cerr << "WSAStartup failed\n";
        return 1;
    }

    SOCKET server_fd = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (server_fd == INVALID_SOCKET) {
        std::cerr << "socket() failed: " << WSAGetLastError() << '\n';
        WSACleanup();
        return 1;
    }

    char opt = 1;
    setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    sockaddr_in address;
    ZeroMemory(&address, sizeof(address));
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(3000);

    if (bind(server_fd, reinterpret_cast<sockaddr*>(&address), sizeof(address)) == SOCKET_ERROR) {
        std::cerr << "bind() failed: " << WSAGetLastError() << '\n';
        closesocket(server_fd);
        WSACleanup();
        return 1;
    }

    if (listen(server_fd, 5) == SOCKET_ERROR) {
        std::cerr << "listen() failed: " << WSAGetLastError() << '\n';
        closesocket(server_fd);
        WSACleanup();
        return 1;
    }

    std::cout << "[C++] TCP Echo Server запущен на порту 3001\n";

    while (true) {
        sockaddr_in clientAddr;
        int addrlen = sizeof(clientAddr);
        SOCKET new_socket = accept(server_fd, reinterpret_cast<sockaddr*>(&clientAddr), &addrlen);
        if (new_socket == INVALID_SOCKET) {
            std::cerr << "accept() failed: " << WSAGetLastError() << '\n';
            break;
        }
        std::cout << "[C++] Клиент подключился\n";

        char buffer[1024];
        while (true) {
            int valread = recv(new_socket, buffer, static_cast<int>(sizeof(buffer)), 0);
            if (valread <= 0) break;

            std::string msg(buffer, buffer + valread);
            std::cout << "[C++] Получено: " << msg << '\n';

            std::string response = "ECHO: " + msg;
            if (send(new_socket, response.c_str(), static_cast<int>(response.length()), 0) == SOCKET_ERROR) {
                std::cerr << "send() failed: " << WSAGetLastError() << '\n';
                break;
            }
        }

        closesocket(new_socket);
        std::cout << "[C++] Клиент отключился\n";
    }

    closesocket(server_fd);
    WSACleanup();
    return 0;
}