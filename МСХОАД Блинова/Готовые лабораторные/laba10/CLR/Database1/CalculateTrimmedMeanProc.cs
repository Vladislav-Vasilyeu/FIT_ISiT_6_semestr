using Microsoft.SqlServer.Server;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Data.SqlTypes;

public partial class StoredProcedures
{
    [Microsoft.SqlServer.Server.SqlProcedure]
    public static void CalculateTrimmedMeanProc(SqlString values)
    {
        if (values.IsNull || string.IsNullOrWhiteSpace(values.Value))
        {
            SqlContext.Pipe.Send("Результат: NULL (недостаточно данных)");
            return;
        }

        string[] strValues = values.Value.Split(new char[] { ',', ' ', ';' },
            StringSplitOptions.RemoveEmptyEntries);

        List<double> numbers = new List<double>();

        foreach (string s in strValues)
        {
            string clean = s.Trim().Replace(".", ",");
            if (double.TryParse(clean, out double num))
                numbers.Add(num);
        }

        if (numbers.Count < 3)
        {
            SqlContext.Pipe.Send("Результат: NULL (меньше 3 значений)");
            return;
        }

        numbers.Sort();
        numbers.RemoveAt(0);
        numbers.RemoveAt(numbers.Count - 1);

        double sum = 0;
        foreach (double n in numbers)
            sum += n;

        double result = sum / numbers.Count;

        SqlContext.Pipe.Send($"Результат (среднее без min/max): {result}");
    }
}
