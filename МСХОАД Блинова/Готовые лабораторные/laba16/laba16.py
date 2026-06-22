import sympy as sp
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import warnings
warnings.filterwarnings("ignore")

print("\nSymPy")

x = sp.symbols('x')
f = x**2 + 1

deriv = sp.diff(f, x)
print(f"Производная функции f(x) = x^2 + 1: {deriv}")

integral = sp.integrate(f, (x, 0, 1))
print(f"Определенный интеграл функции f(x) от 0 до 1: {integral}")

limit = sp.limit(1/x**2 + 1, x, sp.oo)
print(f"Предел функции 1/x^2 + 1 при x стремящемся к бесконечности: {limit}")


print("\nNumPy")

np.random.seed(42)
arr = np.random.randint(0, 100, 20)
print(f"Случайный массив из 20 целых чисел от 0 до 100: {arr}")

arr2d = arr.reshape(4, 5)
print(f"Массив 4x5:\n{arr2d}")

arr1, arr2 = np.vsplit(arr2d, 2)
print(f"Первый массив после вертикального разбиения:\n{arr1}")
print(f"Второй массив после вертикального разбиения:\n{arr2}")

value = 6
found = arr1[arr1 == value]
print(f"Значение {value} найдено в первом массиве: {found}")
print(f"Количество вхождений значения {value} в первом массиве: {len(found)}")

print("\n Во втором масиве:")
print("Минимальное значение:", np.min(arr2))
print("Максимальное значение:", np.max(arr2))
print("Среднее значение:", np.mean(arr2))

print("\nPandas")

s1 = pd.Series(arr)
print(f"Серия из массива:\n{s1.head()}")

data_dict = {'a': 10, 'b': 20, 'c': 30, 'd': 40}
s2 = pd.Series(data_dict)
print(f"Серия из словаря:\n{s2}")

print("\nМатематические операции с серией")
print("Умножение серии на 2:\n", s2 * 2)
print("Среднее значение серии:", s2.mean())

df1 = pd.DataFrame(arr2d, columns=['A', 'B', 'C', 'D', 'E'])
print(f"DataFrame из массива 4x5:\n{df1}")

df2 = pd.DataFrame({
    'Имя': ['Анна', 'Борис', 'Виктор', 'Григорий'],
    'Возраст': [25, 30, 35, 40],
    'Оценка': [85, 90, 95, 80]
})
print(f"DataFrame из словаря:\n{df2}")

print("\n Matplotlib и 3D графики")

plt.figure(figsize=(8,5))
x_plot = np.linspace(-5, 5, 400)
plt.plot(x_plot, x_plot**2 + 1, 'b-', linewidth=2)
plt.title('График функции f(x) = x^2 + 1')
plt.xlabel('x')
plt.ylabel('f(x)')
plt.grid(True)
plt.show()

fig = plt.figure(figsize=(10, 7))
ax = fig.add_subplot(111, projection='3d')
x_surf = np.linspace(-5, 5, 50)
y_surf = np.linspace(-5, 5, 50)
X, Y = np.meshgrid(x_surf, y_surf)
Z = X**2 + 2*Y**2 + 1

ax.plot_surface(X, Y, Z, cmap='viridis')
ax.set_title('3D график функции f(x, y) = x^2 + 2y^2 + 1')
ax.set_xlabel('X')
ax.set_ylabel('Y')
ax.set_zlabel('Z')
plt.show()

fig, axs = plt.subplots(1, 3, figsize=(15, 5))

categories = ['A', 'B', 'C', 'D']
values = [10, 25, 15, 30]
axs[0].bar(categories, values, color='blue')
axs[0].set_title('Столбчатая диаграмма')

axs[1].pie(values, labels=categories, autopct='%1.1f%%', colors=['lightcoral', 'lightskyblue', 'lightgreen', 'lightyellow'])
axs[1].set_title('Круговая диаграмма')  

data_hist = np.random.randn(1000)
axs[2].hist(data_hist, bins=30, color='green', alpha=0.7)
axs[2].set_title('Гистограмма')

plt.tight_layout()
plt.show()

print("\nКонец")