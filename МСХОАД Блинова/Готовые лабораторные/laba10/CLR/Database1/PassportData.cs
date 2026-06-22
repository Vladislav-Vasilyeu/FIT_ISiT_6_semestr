using System;
using System.Data.SqlTypes;
using Microsoft.SqlServer.Server;
using System.Text.RegularExpressions;
using System.IO;

[Serializable]
[SqlUserDefinedType(
    Format.UserDefined, 
    IsByteOrdered = true, 
    MaxByteSize = 100)]
public struct PassportData : INullable, IBinarySerialize
{
    private bool _isNull;
    private string _series;   
    private string _number;   

    public bool IsNull => _isNull;

    public static PassportData Null
    {
        get
        {
            PassportData pd = new PassportData();
            pd._isNull = true;
            pd._series = null;
            pd._number = null;
            return pd;
        }
    }

    public override string ToString()
    {
        return _isNull ? "NULL" : $"{_series} {_number}";
    }

    [SqlMethod(OnNullCall = false)]
    public static PassportData Parse(SqlString s)
    {
        if (s.IsNull) return Null;

        string input = s.Value.Trim().ToUpper();

        var match = Regex.Match(input, @"^([A-ZА-ЯЁ]{2})\s?(\d{7})$");

        if (!match.Success)
            throw new ArgumentException("Неверный формат паспорта! Ожидается: АВ 1234567");

        PassportData pd = new PassportData
        {
            _series = match.Groups[1].Value,
            _number = match.Groups[2].Value,
            _isNull = false
        };
        return pd;
    }

    [SqlMethod(IsDeterministic = true)]
    public SqlString GetSeries() => _isNull ? SqlString.Null : new SqlString(_series);

    [SqlMethod(IsDeterministic = true)]
    public SqlString GetNumber() => _isNull ? SqlString.Null : new SqlString(_number);

   
    public void Read(BinaryReader r)
    {
        
        _isNull = r.ReadBoolean();
        if (_isNull)
        {
            _series = null;
            _number = null;
            return;
        }

        
        _series = r.ReadString();
        _number = r.ReadString();
    }

    public void Write(BinaryWriter w)
    {
        
        w.Write(_isNull);
        if (_isNull) return;

        
        w.Write(_series ?? string.Empty);
        w.Write(_number ?? string.Empty);
    }
}

