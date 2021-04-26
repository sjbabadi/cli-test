class API {
  //Instantiates an API object with two fields
  constructor(url, dropUrl) {
    this.url = url;
    this.dropUrl = dropUrl;
  }

  // Receives an id, makes the request to the server, when response is received,
  // parse it
  // - Returns a Promise
  get(id) {
    return fetch(`${this.url}/${id}`).then(res => res.json());
  }

  getAll() {
    return fetch(`${this.url}`)
      .then((res) => res.json());
  }

  create(data) {
    return fetch(`${this.url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(res => res.json());
  }

  update(id, data) {
    return fetch(`${this.url}/${id}`, {
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(data) }).then(res => res.json());
  }

  delete(id) {
    return fetch(`${this.url}/${id}`, { method: 'DELETE'})
    .then((res) => console.log(`Todo with id ${id} was successfully deleted`));
  }

  drop() {
    return fetch(`${this.dropUrl}`);
  }
}