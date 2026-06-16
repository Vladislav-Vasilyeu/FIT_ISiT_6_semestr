# -*- coding: utf-8 -*-
"""
Лабораторная работа №4 - Симулятор Энигмы (Вариант 5)
L = I, M = Beta, R = Gamma, UKW = B, шаги 3-1-3
Текст вводится только на латинице (A-Z)
"""

import sys
from collections import Counter


class Rotor:
    def __init__(self, wiring, name=""):
        self.wiring = wiring
        self.position = 0     # 0..25
        self.ring = 0         # 0..25

    def set_position(self, letter):
        self.position = (ord(letter.upper()) - ord('A')) % 26

    def set_ring(self, letter):
        self.ring = (ord(letter.upper()) - ord('A')) % 26

    def forward(self, c):
        p = ord(c) - ord('A')
        offset = (self.position - self.ring) % 26
        in_contact = (p + offset) % 26
        out_letter = self.wiring[in_contact]
        out_contact = (ord(out_letter) - ord('A') - offset) % 26
        return chr(out_contact + ord('A'))

    def backward(self, c):
        p = ord(c) - ord('A')
        offset = (self.position - self.ring) % 26
        in_contact = (p + offset) % 26
        for i in range(26):
            if self.wiring[i] == chr(in_contact + ord('A')):
                out_contact = (i - offset) % 26
                return chr(out_contact + ord('A'))
        raise ValueError("Ошибка в проводке ротора")

    def step(self, steps=1):
        self.position = (self.position + steps) % 26



ROT_I     = "EKMFLGDQVZNTOWYHXUSPAIBRCJ"     # I
ROT_BETA  = "LEYJVCNIXWPBQMDRTAKZGFUHOS"     # Beta
ROT_GAMMA = "FSOKANUERHMBTIYCWLQPZXVGJD"     # Gamma
REF_B     = "YRUHQSLDPXNGOKMIEBFZCWVJAT"     # Reflector B

rot_left   = Rotor(ROT_I,     "I")
rot_middle = Rotor(ROT_BETA,  "Beta")
rot_right  = Rotor(ROT_GAMMA, "Gamma")


def enigma_process(text, init_pos="AAA", ring_pos="AAA"):
    
    rot_left.set_position(  init_pos[0])
    rot_middle.set_position(init_pos[1])
    rot_right.set_position( init_pos[2])

    rot_left.set_ring(  ring_pos[0])
    rot_middle.set_ring(ring_pos[1])
    rot_right.set_ring( ring_pos[2])

    result = ""
    text = text.upper()

    for char in text:
        if not ('A' <= char <= 'Z'):
            continue

        # Шаги по варианту 5: 3-1-3
        rot_right.step(3)   # Gamma +3
        rot_middle.step(1)  # Beta +1
        rot_left.step(3)    # I +3

        # Прямой проход
        c = rot_right.forward(char)
        c = rot_middle.forward(c)
        c = rot_left.forward(c)

        # Отражатель
        idx = ord(c) - ord('A')
        c = REF_B[idx]

        # Обратный проход
        c = rot_left.backward(c)
        c = rot_middle.backward(c)
        c = rot_right.backward(c)

        result += c

    return result


def show_frequency(text, label="Текст"):
    if not text:
        print(f"{label}: пустой")
        return

    cnt = Counter(text)
    total = len(text)
    print(f"\n{label} ({total} букв):")
    for letter in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
        freq = cnt.get(letter, 0)
        percent = freq * 100 / total if total > 0 else 0
        print(f"  {letter}: {freq:3d}  ({percent:5.2f}%)")


def main():
    print("="*70)
    print(" Симулятор Энигмы — Вариант 5")
    print(" L = I    M = Beta    R = Gamma    UKW = B")
    print(" Шаги при каждом символе:   L+3   M+1   R+3")
    print(" Вводите текст ТОЛЬКО на латинице (A-Z)")
    print("="*70)

    while True:
        print("\nКоманды:")
        print("  1  — зашифровать / расшифровать текст")
        print("  0  — выход")
        cmd = input("\nВыбор → ").strip()

        if cmd == "0":
            print("До свидания!")
            break

        if cmd != "1":
            print("Введите 1 или 0")
            continue

        text = input("\nТекст (только A-Z): ").strip()
        if not text:
            print("Текст пустой.")
            continue

        pos = input("Начальная позиция (3 буквы, Enter=AAA): ").strip().upper()
        if len(pos) != 3 or not all('A'<=c<='Z' for c in pos):
            pos = "AAA"

        ring = input("Кольцевые установки (3 буквы, Enter=AAA): ").strip().upper()
        if len(ring) != 3 or not all('A'<=c<='Z' for c in ring):
            ring = "AAA"

        print(f"\nИсходный текст:  {text}")
        show_frequency(''.join(c for c in text.upper() if 'A'<=c<='Z'), "Исходный (A-Z)")

        ciphertext = enigma_process(text, pos, ring)

        print(f"\nШифртекст:       {ciphertext}")
        show_frequency(ciphertext, "Шифртекст")

        print("-"*60)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nПрервано.")
    except Exception as e:
        print(f"Ошибка: {e}", file=sys.stderr)