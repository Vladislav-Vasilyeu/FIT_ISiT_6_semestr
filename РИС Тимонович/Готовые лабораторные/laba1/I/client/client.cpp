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
    uint32_t cs;
    int32_t  correction;
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

    std::cout << "Клиент запущен → сервер " << serverIP << ":12345\n\n";

    uint32_t cc = 0;   

    int tc_values[7] = { 1000, 3000, 6000, 8000, 10000, 12000, 14000 };

    for (int tc : tc_values) {
        std::cout << "=== Tc = " << tc << " мс ===\n";

        double sum_corr = 0.0;
        int32_t min_corr = INT32_MAX;
        int32_t max_corr = INT32_MIN;

        for (int i = 1; i <= 10; ++i) {
            
            ClientRequest req = { cc, (uint32_t)i };
            sendto(sock, (char*)&req, sizeof(req), 0, (sockaddr*)&serverAddr, sizeof(serverAddr));

            
            ServerResponse resp{};
            sockaddr_in from{};
            int fromLen = sizeof(from);
            recvfrom(sock, (char*)&resp, sizeof(resp), 0, (sockaddr*)&from, &fromLen);

           
            cc += (uint32_t)resp.correction;

            
            sum_corr += resp.correction;
            if (resp.correction < min_corr) min_corr = resp.correction;
            if (resp.correction > max_corr) max_corr = resp.correction;

            std::cout << "Запрос #" << std::setw(2) << i
                << " | correction = " << std::setw(6) << resp.correction
                << " | Cc после = " << cc << std::endl;

            
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

    std::cout << "Клиент завершил все эксперименты.\nНажмите Enter...";
    std::cin.get();
    return 0;
}