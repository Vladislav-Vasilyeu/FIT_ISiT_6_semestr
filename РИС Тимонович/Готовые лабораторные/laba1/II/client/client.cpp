#include <winsock2.h>
#include <ws2tcpip.h>
#include <iostream>
#include <windows.h>
#include <iomanip>
#include <chrono>
#include <climits>

#pragma comment(lib, "ws2_32.lib")

struct ClientRequest {
    uint64_t curvalue;
    uint32_t request_num;
};

struct ServerResponse {
    uint64_t cs;
    int64_t  correction;
    uint32_t request_num;
};


int main() {
    setlocale(LC_ALL, "Russian");
    WSADATA wsa;
    WSAStartup(MAKEWORD(2, 2), &wsa);

    SOCKET sock = socket(AF_INET, SOCK_DGRAM, 0);

    sockaddr_in serverAddr{};
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_port = htons(12345);
    const char* serverIP = "10.131.116.98";     // ← измени, если сервер на другом ПК
    inet_pton(AF_INET, serverIP, &serverAddr.sin_addr);

    std::cout << "Клиент Часть II запущен (NTP)\n\n";

    uint64_t cc = 0;
    bool initialized = false;

    int tc_values[7] = { 1000, 3000, 6000, 8000, 10000, 12000, 14000 };

    for (int tc : tc_values) {
        std::cout << "=== Tc = " << tc << " ===\n";

        double sum_corr = 0.0;
        double sum_diff = 0.0;

        for (int i = 1; i <= 10; ++i) {
            ClientRequest req = { cc, (uint32_t)i };
            sendto(sock, (char*)&req, sizeof(req), 0, (sockaddr*)&serverAddr, sizeof(serverAddr));

            ServerResponse resp{};
            sockaddr_in from{};
            int fromLen = sizeof(from);
            recvfrom(sock, (char*)&resp, sizeof(resp), 0, (sockaddr*)&from, &fromLen);

            if (!initialized) {
                cc = resp.cs;
                initialized = true;
                std::cout << "[INIT] Cc установлен = " << cc << std::endl;
            }
            else {
                cc += (uint64_t)resp.correction;
            }

            uint64_t ostime = getOStimeMs();
            int64_t diff = (int64_t)cc - (int64_t)ostime;

            sum_corr += resp.correction;
            sum_diff += diff;

            std::cout << "Запрос #" << std::setw(2) << i
                << " | corr = " << std::setw(6) << resp.correction
                << " | Cc-OStime = " << diff << std::endl;

            Sleep(tc);
            cc += tc;
        }

        std::cout << "\nДля Tc = " << tc << ":\n";
        std::cout << "Среднее correction : " << std::fixed << std::setprecision(2) << (sum_corr / 10) << std::endl;
        std::cout << "Среднее Cc - OStime: " << std::fixed << std::setprecision(2) << (sum_diff / 10) << "\n\n";
    }

    closesocket(sock);
    WSACleanup();
    std::cout << "Клиент завершил работу.\n";
    std::cin.get();
    return 0;
}