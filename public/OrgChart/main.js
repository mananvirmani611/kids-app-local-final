let userData = []
let url = 'http://localhost:3000/new-heirarchy';
function setUserData() {
    let items = diagram.items;
    userData = []
    for (const key in items) {
        if (Object.hasOwnProperty.call(items, key)) {
            const element = items[key];
            if (element.id != undefined) {
                let { id, fullName, title, nodeImageLocation, comments, bounds } = element;
                delete bounds.transform;
                delete bounds.type;
                let bossId = element.boss == undefined ? null : element.boss.id;
                userData.push({ id, bossId, fullName, title, imgUrl: nodeImageLocation, comments, bounds })
                // console.log(JSON.stringify(userData));
            }
        }
    }

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    location.href = '/';
}

// function setUserData() {
//     console.log(diagram.items);
//     userData = []
//     console.log(element);
//     if (element.id != undefined) {
//         let { id, fullName, title, nodeImageLocation, comments, bounds } = element;
//         delete bounds.transform;
//         delete bounds.type;
//         let bossId = element.boss == undefined ? null : element.boss.id;
//         userData.push({ id, bossId, fullName, title, imgUrl: nodeImageLocation, comments, bounds })
//         // console.log(JSON.stringify(userData));
//     }

//     let xhr = new XMLHttpRequest();
//     xhr.open("POST", url, true);
//     xhr.setRequestHeader('Content-Type', 'application/json');
//     xhr.send(JSON.stringify(userData));
// }

// function editUserData(node) {
//     let Data = {};
//     if (node.id != undefined) {
//         let { id, fullName, title, nodeImageLocation, comments, bounds } = node;
//         delete bounds.transform;
//         delete bounds.type;
//         let bossId = node.boss == undefined ? null : node.boss.id;
//         Data = { id, bossId, fullName, title, imgUrl: nodeImageLocation, comments, bounds }
//         // console.log(JSON.stringify(userData));

//         let xhr = new XMLHttpRequest();
//         xhr.open("PUT", url);
//         xhr.setRequestHeader('Content-Type', 'application/json');
//         xhr.send(JSON.stringify(Data));
//     }
// }

// function deleteUserData(node){
//     let Data = {};
//     if (node.id != undefined) {
//         let { id, fullName, title, nodeImageLocation, comments, bounds } = node;
//         delete bounds.transform;
//         delete bounds.type;
//         let bossId = node.boss == undefined ? null : node.boss.id;
//         Data = { id, bossId, fullName, title, imgUrl: nodeImageLocation, comments, bounds }
//         // console.log(JSON.stringify(userData));

//         let xhr = new XMLHttpRequest();
//         xhr.open("DELETE", url);
//         xhr.setRequestHeader('Content-Type', 'application/json');
//         xhr.send(JSON.stringify(Data));
//     }
// }
