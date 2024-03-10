const sidebar = document.getElementById('sidebar');
const content = document.getElementById('content');

let isResizing = false;
let lastDownX = 0;

sidebar.addEventListener('mousedown', function(e) {
    isResizing = true;
    lastDownX = e.clientX;
});

document.addEventListener('mousemove', function(e) {
    if (!isResizing) return;

    const offsetRight = document.body.offsetWidth - (e.clientX - content.offsetLeft);
    sidebar.style.width = e.clientX + 'px';
    content.style.width = offsetRight + 'px';
});

document.addEventListener('mouseup', function(e) {
    isResizing = false;
});


function deserializeAllObjects(str) {
    const visited = new WeakSet();

    function deserialize(value) {
        if (typeof value !== 'object' || value === null) {
            return value; // Примитивное значение
        }

        if (visited.has(value)) {
            return '[Circular]'; // Обработка зацикливания
        }

        visited.add(value);

        if (Array.isArray(value)) {
            return value.map(item => deserialize(item)); // Обработка массива
        }

        const deserializedObj = {};
        for (const key in value) {
            deserializedObj[key] = deserialize(value[key]); // Рекурсивный обход объекта
        }
        return deserializedObj;
    }

    const parsedObj = JSON.parse(str);
    return deserialize(parsedObj);
}

/**
 * Messenger API
 */

window.addEventListener('get-all-chats', (event) => {
    const data = event.detail;
    const deserializedObj = deserializeAllObjects(data);
    // console.log(deserializedObj[0])
    deserializedObj.forEach(chat => {
        console.log(chat.title)
        console.log(new Date(chat.date))
        console.log(chat.message.message)
    })
})
window.ipc.getAllChats()