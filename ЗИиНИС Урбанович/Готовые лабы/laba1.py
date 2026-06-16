import math

def gcd_two(a: int, b: int) -> int:
    """НОД двух чисел (алгоритм Евклида)."""
    while b != 0:
        a, b = b, a % b
    return abs(a)

def gcd_three(a: int, b: int, c: int) -> int:
    """НОД трёх чисел."""
    return gcd_two(gcd_two(a, b), c)

def is_prime(n: int) -> bool:
    """Проверка простоты простым перебором до sqrt(n)."""
    if n < 2:
        return False
    if n in (2, 3):
        return True
    if n % 2 == 0:
        return False
    limit = int(math.isqrt(n))
    d = 3
    while d <= limit:
        if n % d == 0:
            return False
        d += 2
    return True

def primes_in_interval(a: int, b: int):
    """Возвращает список простых чисел на отрезке [a, b]."""
    if a > b:
        a, b = b, a
    return [x for x in range(a, b + 1) if is_prime(x)]

def main():
    while True:
        print("\nМеню:")
        print("1. НОД двух чисел")
        print("2. НОД трёх чисел")
        print("3. Поиск простых чисел на отрезке [a, b]")
        print("4. Выход")

        choice = input("Выберите пункт (1-4): ").strip()

        if choice == "1":
            a = int(input("Введите первое число: "))
            b = int(input("Введите второе число: "))
            print(f"НОД({a}, {b}) = {gcd_two(a, b)}")

        elif choice == "2":
            a = int(input("Введите первое число: "))
            b = int(input("Введите второе число: "))
            c = int(input("Введите третье число: "))
            print(f"НОД({a}, {b}, {c}) = {gcd_three(a, b, c)}")

        elif choice == "3":
            a = int(input("Введите a: "))
            b = int(input("Введите b: "))
            primes = primes_in_interval(a, b)
            print(f"Простые числа на отрезке [{a}, {b}]:")
            print(primes)
            print(f"Количество простых чисел: {len(primes)}")

        elif choice == "4":
            print("Выход из программы.")
            break

        else:
            print("Некорректный ввод, попробуйте снова.")

if __name__ == "__main__":
    main()