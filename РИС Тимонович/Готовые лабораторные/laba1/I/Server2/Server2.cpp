#include <winsock2.h>
#include <ws2tcpip.h>
#include <iostream>
#include <ctime>
#include <iomanip>

#pragma comment(lib, "ws2_32.lib")

struct ClientRequest {
    uint32_t curvalue;
    uint32_t request_num;
};

struct ServerResponse {
    uint32_t t1;        
    uint32_t t2;        
    uint32_t request_num;
};

int main() {
    setlocale(LC_ALL, "Russian");
    WSADATA wsa;
    WSAStartup(MAKEWORD(2, 2), &wsa);

    SOCKET sock = socket(AF_INET, SOCK_DGRAM, 0);
    sockaddr_in addr{};
    addr.sin_family = AF_INET;
    addr.sin_port = htons(12345);
    addr.sin_addr.s_addr = INADDR_ANY;

    bind(sock, (sockaddr*)&addr, sizeof(addr));

    std::cout << "=== Улучшенный сервер (п.18) запущен ===\n";

    clock_t startTime = clock();

    while (true) {
        ClientRequest req{};
        sockaddr_in client{};
        int len = sizeof(client);

        recvfrom(sock, (char*)&req, sizeof(req), 0, (sockaddr*)&client, &len);

        clock_t t1 = clock() - startTime;   
        
        
        clock_t t2 = clock() - startTime;   

        ServerResponse resp = { (uint32_t)t1, (uint32_t)t2, req.request_num };

        sendto(sock, (char*)&resp, sizeof(resp), 0, (sockaddr*)&client, len);

        char ip[INET_ADDRSTRLEN];
        inet_ntop(AF_INET, &client.sin_addr, ip, sizeof(ip));
        int port = ntohs(client.sin_port);

        std::cout << "Клиент: " << ip << ":" << port
            << " | Запрос #" << req.request_num
            << " | t1=" << t1 << " | t2=" << t2 << std::endl;
    }
}