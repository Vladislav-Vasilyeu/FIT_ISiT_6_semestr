#include <winsock2.h>
#include <ws2tcpip.h>
#include <iostream>
#include <iomanip>
#include <atomic>
#include <chrono>
#include <thread>

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

std::atomic<uint64_t> serverTimeMs(0);

uint64_t getCurrentSystemMs() {
    auto now = std::chrono::system_clock::now();
    return std::chrono::duration_cast<std::chrono::milliseconds>(now.time_since_epoch()).count();
}

uint64_t getNTPTime() {
    WSADATA wsa;
    if (WSAStartup(MAKEWORD(2, 2), &wsa) != 0) return 0;

    SOCKET sock = socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP);
    if (sock == INVALID_SOCKET) {
        WSACleanup();
        return 0;
    }

    DWORD timeout = 3000;
    setsockopt(sock, SOL_SOCKET, SO_RCVTIMEO, (char*)&timeout, sizeof(timeout));

    const char* servers[] = { "162.159.200.123", "20.189.79.72", "104.16.132.229" };

    struct NTPPacket { uint8_t data[48] = {}; } packet;
    packet.data[0] = 0x1B; // Version 3, Client

    for (const char* ip : servers) {
        sockaddr_in serv{};
        serv.sin_family = AF_INET;
        serv.sin_port = htons(123);
        inet_pton(AF_INET, ip, &serv.sin_addr);

        if (sendto(sock, (char*)&packet, 48, 0, (sockaddr*)&serv, sizeof(serv)) != 48)
            continue;

        NTPPacket resp{};
        sockaddr_in from{};
        int flen = sizeof(from);
        if (recvfrom(sock, (char*)&resp, 48, 0, (sockaddr*)&from, &flen) > 40) {
            uint32_t sec = ntohl(*(uint32_t*)(resp.data + 40));
            uint32_t frac = ntohl(*(uint32_t*)(resp.data + 44));

            const uint32_t DELTA = 2208988800u;
            uint64_t timeMs = ((uint64_t)(sec - DELTA)) * 1000ULL +
                ((uint64_t)frac * 1000ULL / 0xFFFFFFFFULL);

            closesocket(sock);
            WSACleanup();
            return timeMs;
        }
    }
    closesocket(sock);
    WSACleanup();
    return 0;
}

void ntpSyncThread() {
    while (true) {
        uint64_t t = getNTPTime();
        if (t > 1700000000000ULL) {
            serverTimeMs = t;
            std::cout << "[NTP] Успешно: " << t << " ms\n";
        }
        else {
            std::cout << "[NTP] Ошибка синхронизации\n";
        }
        std::this_thread::sleep_for(std::chrono::milliseconds(10000));
    }
}

int main() {
    setlocale(LC_ALL, "Russian");
    WSADATA wsa;
    WSAStartup(MAKEWORD(2, 2), &wsa);

    std::thread(ntpSyncThread).detach();
    std::this_thread::sleep_for(std::chrono::seconds(4));

    SOCKET sock = socket(AF_INET, SOCK_DGRAM, 0);
    sockaddr_in addr{};
    addr.sin_family = AF_INET;
    addr.sin_port = htons(12345);
    addr.sin_addr.s_addr = INADDR_ANY;

    bind(sock, (sockaddr*)&addr, sizeof(addr));

    std::cout << "=== Сервер Часть II (NTP) запущен ===\n\n";

    while (true) {
        ClientRequest req{};
        sockaddr_in client{};
        int len = sizeof(client);

        recvfrom(sock, (char*)&req, sizeof(req), 0, (sockaddr*)&client, &len);

        uint64_t cs = serverTimeMs.load();
        if (cs == 0) cs = getCurrentSystemMs();

        int64_t correction = (req.curvalue == 0) ? 0LL : (int64_t)(cs - req.curvalue);

        ServerResponse resp = { cs, correction, req.request_num };
        sendto(sock, (char*)&resp, sizeof(resp), 0, (sockaddr*)&client, len);

        char ip[INET_ADDRSTRLEN];
        inet_ntop(AF_INET, &client.sin_addr, ip, sizeof(ip));

        std::cout << "Клиент: " << ip
            << " | Запрос #" << req.request_num
            << " | correction = " << correction
            << " | Cs = " << cs << std::endl;
    }
}