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
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", 'http://localhost:3000/edit-heirarchy/'+urlId, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(userData));
    location.href = '/';
}
