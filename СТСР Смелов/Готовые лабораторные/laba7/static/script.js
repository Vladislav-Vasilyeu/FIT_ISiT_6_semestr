document.addEventListener('DOMContentLoaded', () => {
  const output = document.getElementById('output');

  document.getElementById('jsonBtn').addEventListener('click', async () => {
    try {
      const response = await fetch('/data.json');
      if (!response.ok) throw new Error('Ошибка запроса: ' + response.status);
      const data = await response.json();
      output.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      output.textContent = 'JSON fetch error: ' + err;
    }
  });

  document.getElementById('xmlBtn').addEventListener('click', async () => {
    try {
      const response = await fetch('/data.xml');
      if (!response.ok) throw new Error('Ошибка запроса: ' + response.status);
      const text = await response.text();
      output.textContent = text;
    } catch (err) {
      output.textContent = 'XML fetch error: ' + err;
    }
  });
});
