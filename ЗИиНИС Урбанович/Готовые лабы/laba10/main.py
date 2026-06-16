#!/usr/bin/env python3
import sys
from rsa_ecp import RSA_Signer
from elgamal_ecp import ElGamal_Signer
from schnorr_ecp import Schnorr_Signer
from utils import time_it

def print_menu():
    print("\n" + "="*60)
    print("ЛАБОРАТОРНАЯ РАБОТА №10")
    print("Исследование алгоритмов ЭЦП: RSA, Эль-Гамаль, Шнорр")
    print("="*60)
    print("1. RSA")
    print("2. Эль-Гамаль")
    print("3. Шнорр")
    print("4. Выход")
    print("-"*60)

def algo_menu(algo_name, signer):
    while True:
        print(f"\n--- {algo_name} ---")
        print("1. Сгенерировать ключи")
        print("2. Подписать сообщение")
        print("3. Проверить подпись")
        print("4. Экспорт открытого ключа (файл уже сохранён)")
        print("5. Вернуться в главное меню")
        
        choice = input("Выберите действие: ")
        
        if choice == '1':
            bits = input("Размер ключа в битах (512/1024/2048): ")
            bits = int(bits) if bits else 512
            print(f"Генерация ключей...")
            _, time_gen = time_it(signer.generate_keys, bits)
            print(f"✅ Ключи сгенерированы за {time_gen:.4f} сек")
            print(f"Открытый ключ сохранён в keys/{algo_name.lower()}/public.key")
        
        elif choice == '2':
            message = input("Введите сообщение для подписи: ")
            if not message:
                print("❌ Сообщение не может быть пустым")
                continue
            try:
                signature, time_sign = time_it(signer.sign, message)
                print(f"✅ Подпись создана за {time_sign:.4f} сек")
                print(f"Подпись: {signature}")
                # Сохраняем подпись для проверки
                with open(f"signature_{algo_name.lower()}.txt", 'w') as f:
                    f.write(str(signature))
                print(f"Подпись сохранена в signature_{algo_name.lower()}.txt")
            except Exception as e:
                print(f"❌ Ошибка: {e}")
        
        elif choice == '3':
            message = input("Введите сообщение для проверки: ")
            if not message:
                print("❌ Сообщение не может быть пустым")
                continue
            
            # Загружаем подпись
            try:
                with open(f"signature_{algo_name.lower()}.txt", 'r') as f:
                    sig_str = f.read().strip()
                # Преобразуем строку в подпись (кортеж для Эль-Гамаля/Шнорра)
                if algo_name == "RSA":
                    signature = int(sig_str)
                elif algo_name == "Эль-Гамаль":
                    parts = sig_str.strip('()').split(',')
                    signature = (int(parts[0]), int(parts[1]))
                else:  # Шнорр
                    parts = sig_str.strip('()').split(',')
                    signature = (int(parts[0]), int(parts[1]))
            except:
                print("❌ Не удалось загрузить подпись. Сначала подпишите сообщение.")
                continue
            
            try:
                result, time_ver = time_it(signer.verify, message, signature)
                print(f"✅ Верификация выполнена за {time_ver:.4f} сек")
                if result:
                    print("🎉 ПОДПИСЬ ВЕРНА!")
                else:
                    print("❌ ПОДПИСЬ НЕВЕРНА!")
            except Exception as e:
                print(f"❌ Ошибка: {e}")
        
        elif choice == '4':
            print(f"Открытый ключ находится в: keys/{algo_name.lower()}/public.key")
            print("Для обмена по сети передайте этот файл получателю.")
        
        elif choice == '5':
            break
        
        else:
            print("❌ Неверный выбор")

def main():
    rsa = RSA_Signer()
    elgamal = ElGamal_Signer()
    schnorr = Schnorr_Signer()
    
    while True:
        print_menu()
        choice = input("Выберите алгоритм (1-4): ")
        
        if choice == '1':
            algo_menu("RSA", rsa)
        elif choice == '2':
            algo_menu("Эль-Гамаль", elgamal)
        elif choice == '3':
            algo_menu("Шнорр", schnorr)
        elif choice == '4':
            print("До свидания!")
            sys.exit(0)
        else:
            print("❌ Неверный выбор")

if __name__ == "__main__":
    main()