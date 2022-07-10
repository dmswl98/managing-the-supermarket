const $categoryBtn = document.querySelector(".market-category");
const $categoryTitle = document.querySelector(".chosen-category-name");
const $productCount = document.querySelector(".list-count");
const $productForm = document.querySelector(".product-form");
const $inputNameField = document.querySelector(".name-field");
const $inputCountField = document.querySelector(".count-field");
const $inputBtn = document.querySelector(".input-submit");
const $productList = document.querySelector(".product-list");
const $sortBtn = document.querySelector(".sort-button");

$productForm.addEventListener("submit", (e) => {
  e.preventDefault();
});

const store = {
  setLocalStorage(supermarket) {
    localStorage.setItem("supermarket", JSON.stringify(supermarket));
  },
  getLocalStorage() {
    return JSON.parse(localStorage.getItem("supermarket"));
  },
};

function App() {
  this.supermarket = {
    Vegetables: [],
    Meat: [],
    Milk: [],
    Cookie: [],
    Beverage: [],
  };

  this.currentCategory = "Vegetables";

  this.init = () => {
    if (store.getLocalStorage()) {
      this.supermarket = store.getLocalStorage();
    }
    render();
    initEventListeners();
  };

  const render = (sortList = false) => {
    let data = this.supermarket[this.currentCategory];
    if (sortList) data = sortList;
    const template = data
      .map((item, index) => {
        return `
            <li data-product-id="${index}" class="product-list-item">
              <div class="${item.soldOut ? "sold-out" : ""} product-detail">
                <div class="product-name">${item.name}</div>
                <div class="product-count">${item.count}개</div>
              </div>
              <div class="button-group">
                <div class="count-control-buttons">
                  <button type="button" class="count-control-button add-button">+</button>  
                  <button type="button" class="count-control-button sub-button">-</button>
                </div>
                <button type="button" class="product-item-button soldOut-button">품절</button>
                <button type="button" class="product-item-button edit-button">수정</button>
                <button type="button" class="product-item-button delete-button">삭제</button>
              </div>
            </li>`;
      })
      .join("");
    $productList.innerHTML = template;
    updateProductCount();
  };

  const updateProductCount = () => {
    let productCount = 0;
    this.supermarket[this.currentCategory].map((item) => {
      if (!item.soldOut) productCount++;
    });
    $productCount.innerHTML = `${productCount}`;
  };

  const addProductName = () => {
    if ($inputNameField.value === "" || $inputCountField.value === "") return;
    const productName = $inputNameField.value;
    const productCount = Number($inputCountField.value);
    const overlap = this.supermarket[this.currentCategory].filter(
      (v) => v.name === productName
    ).length;
    if (overlap) {
      alert("이미 목록에 존재하는 상품입니다.");
      $inputNameField.value = "";
      $inputCountField.value = "";
      return;
    }

    this.supermarket[this.currentCategory].push({
      name: productName,
      count: productCount,
    });
    store.setLocalStorage(this.supermarket);

    $inputNameField.value = "";
    $inputCountField.value = "";

    const productList = [...this.supermarket[this.currentCategory]];
    if ($sortBtn.classList.contains("is-active")) {
      productList.sort((a, b) => {
        let x = a.name;
        let y = b.name;
        return x.localeCompare(y);
      });
      render(productList);
      return;
    }
    render();
  };

  const editProductName = (e) => {
    const productId = e.target.closest("li").dataset.productId;
    const $productName = e.target.closest("li").querySelector(".product-name");
    const productName = $productName.innerText;
    const updateProductName = prompt(
      "Please fill out the corrections.",
      productName
    );
    if (updateProductName === null || updateProductName === "") return;
    this.supermarket[this.currentCategory][productId].name = updateProductName;
    store.setLocalStorage(this.supermarket);
    render();
  };

  const deleteProductName = (e) => {
    if (confirm("삭제하시겠습니까?")) {
      const productId = e.target.closest("li").dataset.productId;
      this.supermarket[this.currentCategory].splice(productId, 1);
      store.setLocalStorage(this.supermarket);
      render();
    }
  };

  const soldOutProduct = (e) => {
    const productId = e.target.closest("li").dataset.productId;
    this.supermarket[this.currentCategory][productId].soldOut =
      !this.supermarket[this.currentCategory][productId].soldOut;
    const productCount =
      this.supermarket[this.currentCategory][productId].count;
    if (productCount)
      this.supermarket[this.currentCategory][productId].count = 0;
    else this.supermarket[this.currentCategory][productId].count = 1;
    store.setLocalStorage(this.supermarket);
    render();
  };

  const addProduct = (e) => {
    const productId = e.target.closest("li").dataset.productId;
    const productCount =
      this.supermarket[this.currentCategory][productId].count;
    if (productCount === 0) soldOutProduct(e);
    this.supermarket[this.currentCategory][productId].count =
      Number(productCount) + 1;
    store.setLocalStorage(this.supermarket);
    render();
  };

  const subProduct = (e) => {
    const productId = e.target.closest("li").dataset.productId;
    const productCount =
      this.supermarket[this.currentCategory][productId].count;
    if (productCount === 0) return;
    if (productCount === 1) soldOutProduct(e);
    this.supermarket[this.currentCategory][productId].count =
      Number(productCount) - 1;
    store.setLocalStorage(this.supermarket);
    render();
  };

  const sortProduct = () => {
    let productList = [...this.supermarket[this.currentCategory]];
    const soldOutItem = productList.filter((v) => v?.soldOut);
    productList = productList
      .filter((v) => !v?.soldOut)
      .sort((a, b) => {
        let x = a.name;
        let y = b.name;
        return x.localeCompare(y);
      });
    render(soldOutItem.concat(productList));
  };

  const initEventListeners = () => {
    $inputBtn.addEventListener("click", addProductName);

    $inputNameField.addEventListener("keypress", (e) => {
      if (e.key !== "Enter") return;
      addProductName();
    });

    $sortBtn.addEventListener("click", (e) => {
      $sortBtn.classList.toggle("is-active");
      console.log(this.supermarket[this.currentCategory]);
      if ($sortBtn.classList.contains("is-active")) sortProduct();
      else render();
    });

    $productList.addEventListener("click", (e) => {
      if (e.target.classList.contains("add-button")) {
        addProduct(e);
        return;
      }

      if (e.target.classList.contains("sub-button")) {
        subProduct(e);
        return;
      }

      if (e.target.classList.contains("edit-button")) {
        editProductName(e);
        return;
      }

      if (e.target.classList.contains("delete-button")) {
        deleteProductName(e);
        return;
      }

      if (e.target.classList.contains("soldOut-button")) {
        soldOutProduct(e);
        return;
      }
    });

    $categoryBtn.addEventListener("click", (e) => {
      const isCategoryBtn = e.target.classList.contains("market-category-name");
      if (isCategoryBtn) {
        const categoryName = e.target.closest("button").dataset.categoryName;
        const categoryTitle = e.target.innerText;
        this.currentCategory = categoryName;
        $categoryTitle.innerText = categoryTitle;
        render();
      }
    });
  };
}

const app = new App();
app.init();
