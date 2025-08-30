// axiosはHTMLテンプレートでscriptタグで読み込み、
// ビルド時にnode_modulesからコピーして利用

document.addEventListener('DOMContentLoaded', () => {
  const createTable = (users) => {
    if (!users || users.length === 0) {
      const p = document.createElement('p');
      p.textContent = 'No data received.';
      return p;
    }
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    const headerRow = document.createElement('tr');
    Object.keys(users[0]).forEach(key => {
      const th = document.createElement('th');
      th.textContent = key;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    users.forEach(user => {
      const row = document.createElement('tr');
      Object.values(user).forEach(value => {
        const td = document.createElement('td');
        td.innerHTML = value; // HTMLエンティティ(&yen;等)を表示するため
        row.appendChild(td);
      });
      tbody.appendChild(row);
    });
    table.appendChild(thead);
    table.appendChild(tbody);
    return table;
  };

  const render = (containerId, content) => {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    container.appendChild(content);
  };

  const renderError = (containerId, error) => {
    const container = document.getElementById(containerId);
    container.innerHTML = `<p style="color: red;">Error: ${error.message || String(error)}</p>`;
  };

  // --- 1. fetch + TextDecoder ---
  fetch('/api?api=users-sjis')
    .then(response => {
      if (!response.ok) throw new Error(`Network error: ${response.status}`);
      return response.arrayBuffer(); // 生のバイナリデータを取得
    })
    .then(buffer => {
      // Shift_JISとしてデコード
      const decoder = new TextDecoder('shift_jis');
      const text = decoder.decode(buffer);
      return JSON.parse(text);
    })
    .then(users => render('sjis-data-fetch', createTable(users)))
    .catch(error => renderError('sjis-data-fetch', error));

  // --- 2. XMLHttpRequest ---
  const xhr = new XMLHttpRequest();
  xhr.open('GET', '/api?api=users-sjis');
  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const users = JSON.parse(xhr.responseText);
        render('sjis-data-xhr', createTable(users));
      } catch (e) {
        renderError('sjis-data-xhr', e);
      }
    } else {
      renderError('sjis-data-xhr', `Request failed: ${xhr.status}`);
    }
  };
  xhr.onerror = () => renderError('sjis-data-xhr', 'Request error');
  xhr.send();

  // --- 3. axios ---
  // axiosはグローバルに読み込まれている前提
  if (window.axios) {
    axios.get('/api?api=users-sjis', {
      // レスポンスをテキストとして受け取り、
      // Content-Typeヘッダーに基づくブラウザの自動デコードに期待する
      responseType: 'text'
    })
    .then(response => {
      // response.dataが正しくデコードされた文字列であることを期待
      const users = JSON.parse(response.data);
      render('sjis-data-axios', createTable(users));
    })
    .catch(error => renderError('sjis-data-axios', error));
  } else {
    renderError('sjis-data-axios', 'axios is not loaded.');
  }


  // --- API (UTF-8) for comparison ---
  fetch('/api?api=users-utf8')
    .then(response => {
      if (!response.ok) throw new Error(`Network error: ${response.status}`);
      return response.json();
    })
    .then(users => render('utf8-data', createTable(users)))
    .catch(error => renderError('utf8-data', error));
});
