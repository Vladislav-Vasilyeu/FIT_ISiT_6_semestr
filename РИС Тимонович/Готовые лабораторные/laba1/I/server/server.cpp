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
    uint32_t cs;
    int32_t correction;
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

    std::cout << "=== Простой сервер (Часть I) запущен на порту 12345 ===\n";

    clock_t startTime = clock();
    double sumCorr = 0.0;
    int count = 0;

    while (true) {
        ClientRequest req{};
        sockaddr_in client{};
        int len = sizeof(client);

        recvfrom(sock, (char*)&req, sizeof(req), 0, (sockaddr*)&client, &len);

        clock_t cs = clock() - startTime;
        int32_t correction = (int32_t)cs - (int32_t)req.curvalue;

        ServerResponse resp = { (uint32_t)cs, correction, req.request_num };
        sendto(sock, (char*)&resp, sizeof(resp), 0, (sockaddr*)&client, len);

        
        char ip[INET_ADDRSTRLEN];
        inet_ntop(AF_INET, &client.sin_addr, ip, sizeof(ip));
        int clientPort = ntohs(client.sin_port);

        std::cout << "Клиент: " << ip << ":" << clientPort
            << " | Запрос #" << req.request_num
            << " | correction = " << correction << std::endl;

        sumCorr += correction;
        count++;
        std::cout << "Среднее correction: " << std::fixed << std::setprecision(2)
            << (sumCorr / count) << "\n\n";
    }
}