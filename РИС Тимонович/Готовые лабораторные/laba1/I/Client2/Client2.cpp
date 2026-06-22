#include <winsock2.h>
#include <ws2tcpip.h>
#include <iostream>
#include <windows.h>
#include <iomanip>
#include <climits>

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

    sockaddr_in serverAddr{};
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_port = htons(12345);
    const char* serverIP = "10.131.116.98";        
    inet_pton(AF_INET, serverIP, &serverAddr.sin_addr);

    std::cout << "Улучшенный клиент запущен\n\n";

    uint32_t cc = 0;
    int tc_values[7] = { 1000, 3000, 6000, 8000, 10000, 12000, 14000 };

    for (int tc : tc_values) {
        std::cout << "=== Tc = " << tc << " мс ===\n";

        double sum_corr = 0.0;
        int32_t min_corr = INT32_MAX;
        int32_t max_corr = INT32_MIN;

        for (int i = 1; i <= 10; ++i) {
            uint32_t send_time = cc;                    

            ClientRequest req = { cc, (uint32_t)i };
            sendto(sock, (char*)&req, sizeof(req), 0, (sockaddr*)&serverAddr, sizeof(serverAddr));

            ServerResponse resp{};
            sockaddr_in from{};
            int fromLen = sizeof(from);
            recvfrom(sock, (char*)&resp, sizeof(resp), 0, (sockaddr*)&from, &fromLen);

            uint32_t recv_time = cc + tc;               

            
            uint32_t rtt = recv_time - send_time;

            
            int32_t correction = (int32_t)resp.t2 - (int32_t)cc + (int32_t)(rtt / 2);

            cc += (uint32_t)correction;

            sum_corr += correction;
            if (correction < min_corr) min_corr = correction;
            if (correction > max_corr) max_corr = correction;

            std::cout << "Запрос #" << std::setw(2) << i
                << " | correction = " << std::setw(6) << correction
                << " | Cc = " << cc << std::endl;

            Sleep(tc);
            cc += tc;
        }

        double avg = sum_corr / 10.0;

        std::cout << "\nДля Tc = " << tc << ":\n";
        std::cout << "Max correction     : " << max_corr << std::endl;
        std::cout << "Min correction     : " << min_corr << std::endl;
        std::cout << "Среднее correction : " << std::fixed << std::setprecision(2) << avg << "\n\n";
    }

    closesocket(sock);
    WSACleanup();
    std::cin.get();
    return 0;
}