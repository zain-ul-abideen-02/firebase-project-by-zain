
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import {
      initializeFirestore,
      collection,
      addDoc,
      onSnapshot,
      deleteDoc,
      updateDoc,
      doc
    } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
    import {
      getAuth,
      signOut
    } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

    
    const firebaseConfig = {
      apiKey: "AIzaSyAjUJZyLk9RxcUC5n_vrxTq0cRXMylLmAs",
      authDomain: "fire-base-project-e25ab.firebaseapp.com",
      projectId: "fire-base-project-e25ab",
      appId: "1:495616776229:web:f8c9da94e3b8aaea9b47cc"
    };

    const app = initializeApp(firebaseConfig);
    const db = initializeFirestore(app, { experimentalForceLongPolling: true });
    const auth = getAuth();

    const itemsCol = collection(db, "items");
    const itemForm = document.getElementById("itemForm");
    const itemsRow = document.getElementById("itemsRow");

    const imgURL = document.getElementById("imgURL");
    const name = document.getElementById("name");
    const price = document.getElementById("price");
    const desc = document.getElementById("desc");
    const itemId = document.getElementById("itemId");

    
    itemForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = {
        imgURL: imgURL.value,
        name: name.value,
        price: parseFloat(price.value),
        desc: desc.value
      };

      if (itemId.value) {
        const ref = doc(db, "items", itemId.value);
        await updateDoc(ref, data);
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Item updated successfully.',
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await addDoc(itemsCol, data);
        Swal.fire({
          icon: 'success',
          title: 'Added!',
          text: 'New item added successfully.',
          timer: 1500,
          showConfirmButton: false,
        });
      }

      itemForm.reset();
      itemId.value = "";
      const modal = bootstrap.Modal.getInstance(document.getElementById("addItemModal"));
      modal.hide();
    });

    
    onSnapshot(itemsCol, (snapshot) => {
      itemsRow.innerHTML = "";
      snapshot.forEach((docSnap) => {
        const item = docSnap.data();
        const id = docSnap.id;

        const col = document.createElement("div");
        col.className = "col-md-4 mb-4";
        col.innerHTML = `
          <div class="card">
            <img src="${item.imgURL}" class="card-img-top" alt="${item.name}" />
            <div class="card-body">
              <h5 class="card-title">${item.name}</h5>
              <p class="card-text">${item.desc}</p>
              <p class="fw-bold">$${item.price.toFixed(2)}</p>
              <button class="btn btn-sm btn-primary me-2" data-id="${id}">Edit</button>
              <button class="btn btn-sm btn-danger">Delete</button>
            </div>
          </div>
        `;

        
        const editBtn = col.querySelector('.btn-primary');
        editBtn.addEventListener('click', () => {
          itemId.value = id;
          imgURL.value = item.imgURL;
          name.value = item.name;
          price.value = item.price;
          desc.value = item.desc;
          new bootstrap.Modal(document.getElementById("addItemModal")).show();
        });

        const deleteBtn = col.querySelector('.btn-danger');
        deleteBtn.addEventListener('click', async () => {
          const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff4d6d',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete it!'
          });
          if (result.isConfirmed) {
            await deleteDoc(doc(db, "items", id));
            Swal.fire(
              'Deleted!',
              'Your item has been deleted.',
              'success'
            );
          }
        });

        itemsRow.appendChild(col);
      });
    });

    
    document.getElementById("logoutBtn").addEventListener("click", () => {
      signOut(auth).then(() => {
        window.location.href = "index.html";
      });
    });
  