window.onload = () => {
  const urlForm = document.getElementById('urlForm');
  const url = document.getElementById('url');
  const result = document.getElementById('result');
  const copyBtn = document.getElementById('copyToClipboard');

  urlForm.addEventListener('submit', (event) => {
    event.preventDefault();
    fetch('http://localhost:3000/scrape', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: url.value,
      })
    })
      .then(response => response.json())
      .then((jsonResult) => {
        copyBtn.classList.remove('invisible');
        result.innerHTML = `<pre>${JSON.stringify(jsonResult, null, '  ')}</pre>`;
      });
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(result.innerText);
    copyBtn.innerText = 'Copied!';
    setTimeout(() => {
      copyBtn.innerText = 'Copy To Clipboard';
    }, 2000);
  });
};
