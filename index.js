const nameDb = "myDatabase";
const tabela = "tarefa";

const formAction = document.getElementById("formAdd");
let formAddTarefa = {
  nome: document.getElementById("nome"),
  status: document.getElementById("status"),
  dataInicio: new Date().toLocaleDateString(),
  dataFim: "",
};
function CreateDataBase() {
  if (window.indexedDB) {
    const request = indexedDB.open(nameDb, 1);
    request.onsuccess = function (event) {
      document.getElementById("outputDb").innerHTML =
        event.target.result.name + " criado, pronto para salvar dados";
    };
    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      const objectStore = db.createObjectStore(tabela, {
        keyPath: "id",
        autoIncrement: true,
      });
      objectStore.createIndex("nome", "nome", { unique: false });
      objectStore.createIndex("dataInicio", "dataInicio", { unique: false });
      objectStore.createIndex("dataFim", "dataFim", { unique: false });
      objectStore.createIndex("status", "status", { unique: false });
    };
    request.onerror = function (event) {
      alert("Error opening database");
    };
  } else {
    document.getElementById("outputDb").innerHTML = "Database not created";
  }
}

function addItemToDB() {
  let item = {
    nome: formAddTarefa.nome.value,
    dataInicio: new Date().toLocaleDateString(),
    status: formAddTarefa.status.value,
    dataFim:
      formAddTarefa.status.value === "CONCLUIDO"
        ? new Date().toLocaleDateString()
        : "",
  };
  const request = indexedDB.open(nameDb, 1);
  request.onsuccess = function (event) {
    const db = event.target.result;
    const transaction = db.transaction(tabela, "readwrite");
    const objectStore = transaction.objectStore(tabela);
    const addItemRequest = objectStore.add(item);
    addItemRequest.onsuccess = function (event) {
      console.log("Item adicionado ao IndexedDB com sucesso!");
    };
    addItemRequest.onerror = function (event) {
      console.error("Erro ao adicionar item ao IndexedDB:", event.target.error);
    };
  };
  request.onerror = function (event) {
    console.error("Erro ao abrir o banco de dados:", event.target.error);
  };
}
function contrucList(items) {
  const lista = document.querySelector("#minha-lista");
  lista.innerHTML = items
    .map(
      (item) =>
        `
          <li data-item-id="${item.id}">
            <div>
            Nome: ${item.nome} <br>
            Status: ${item.status}<br>
            Data Inicial: ${item.dataInicio}
            ${item.status  == "CONCLUIDO" ?  "<br>Data Final: " + item.dataFim : "" }
            </div>
            <div class="divButtons">
              <button class="btnConcluir" ${item.status != "CONCLUIDO" ? "": "disabled"}>
                ${item.status != "CONCLUIDO" ? "Avançar": "Concluido"}

              </button> 
              <button class="btnApagar">
                Apagar
              </button>
            </div>
          </li>
`
    )
    .join("");
}
function getItemsFromDB() {
  const request = indexedDB.open(nameDb, 1);
  request.onsuccess = function (event) {
    const db = event.target.result;
    const transaction = db.transaction(tabela, "readonly");
    const objectStore = transaction.objectStore(tabela);
    const getAllRequest = objectStore.getAll();
    getAllRequest.onsuccess = function (event) {
      const items = event.target.result;
      contrucList(items);
      console.log(items); // Aqui você pode fazer o que quiser com os dados retornados
    };
    getAllRequest.onerror = function (event) {
      console.error("Erro ao buscar itens do IndexedDB:", event.target.error);
    };
  };
  request.onerror = function (event) {
    console.error("Erro ao abrir o banco de dados:", event.target.error);
  };
}

function OnSubmitButton(event) {
  //   console.log(formAddTarefa.nome.value+ " "+ formAddTarefa.status.value+ " "+ formAddTarefa.dataInicio+ " "+ formAddTarefa.dataFim);
  addItemToDB();
  getItemsFromDB();

  event.preventDefault();
}
function DeletItemFromDB(itemId) {
  const request = indexedDB.open(nameDb, 1);

  request.onsuccess = function (event) {
    const db = event.target.result;
    const transaction = db.transaction(tabela, "readwrite");
    const objectStore = transaction.objectStore(tabela);

    const deleteRequest = objectStore.delete(Number(itemId));

    deleteRequest.onsuccess = function (event) {
      console.log("Item deletado do IndexedDB com sucesso!", itemId);
      getItemsFromDB(); // Atualiza a lista após a exclusão
    };

    deleteRequest.onerror = function (event) {
      console.error("Erro ao excluir item do IndexedDB:", event.target.error);
    };
  };

  request.onerror = function (event) {
    console.error("Erro ao abrir o banco de dados:", event.target.error);
  };
}

function changeItemStatus(itemId) {
  const request = indexedDB.open(nameDb, 1);

  request.onsuccess = function (event) {
    const db = event.target.result;
    const transaction = db.transaction(tabela, "readwrite");
    const objectStore = transaction.objectStore(tabela);

    const getRequest = objectStore.get(Number(itemId));

    getRequest.onsuccess = function (event) {
      const item = event.target.result;
      console.log(event.target.result);
      if (item.status === "PENDENTE" ) {
        item.status = "EM ANDAMENTO";
      } else if (item.status === "EM ANDAMENTO") {
        item.status = "CONCLUIDO";
        item.dataFim = new Date().toLocaleDateString();
      }

      const updateRequest = objectStore.put(item);

      updateRequest.onsuccess = function (event) {
        console.log("Item atualizado no IndexedDB com sucesso!", item);
        getItemsFromDB(); // Atualiza a lista após a atualização
      };

      updateRequest.onerror = function (event) {
        console.error("Erro ao atualizar item no IndexedDB:", event.target.error);
      };
    };

    getRequest.onerror = function (event) {
      console.error("Erro ao obter item do IndexedDB:", event.target.error);
    };
  };

  request.onerror = function (event) {
    console.error("Erro ao abrir o banco de dados:", event.target.error);
  };
}


function deleteItemFromDB(itemId) {
  const request = indexedDB.open(nameDb, 1);

  request.onsuccess = function (event) {
    const db = event.target.result;
    const transaction = db.transaction(tabela, "readwrite");
    const objectStore = transaction.objectStore(tabela);

    const deleteRequest = objectStore.delete(itemId);

    deleteRequest.onsuccess = function (event) {
      console.log("Item deletado do IndexedDB com sucesso!", itemId);
      getItemsFromDB(); // Atualiza a lista após a exclusão
    };

    deleteRequest.onerror = function (event) {
      console.error("Erro ao excluir item do IndexedDB:", event.target.error);
    };
  };

  request.onerror = function (event) {
    console.error("Erro ao abrir o banco de dados:", event.target.error);
  };
}


CreateDataBase();
getItemsFromDB();
document.getElementById("minha-lista").addEventListener("click", (event) => {
  const btnApagar = event.target.closest('.btnApagar');
  const btnConcluir = event.target.closest('.btnConcluir');

  if (btnApagar) {
    const li = btnApagar.closest('li');
    const itemId = li.dataset.itemId;

    if (itemId) {
      // Agora você tem o ID do item, pode usar para deletar do IndexedDB
      DeletItemFromDB(itemId);
    }
  }
  if (btnConcluir) {
    const li = btnConcluir.closest('li');
    const itemId = li.dataset.itemId;

    if (itemId) {
      // Agora você tem o ID do item, pode usar para deletar do IndexedDB
      changeItemStatus(itemId)
    }
  }
});
formAction.addEventListener("submit", OnSubmitButton);
