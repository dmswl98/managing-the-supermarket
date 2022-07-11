import ProductApi from "./api.js";

const $categoryBtn = document.querySelector(".market-category");
const $categoryTitle = document.querySelector(".chosen-category-name");
const $productCount = document.querySelector(".list-count");
const $inputNameField = document.querySelector(".name-field");
const $inputCountField = document.querySelector(".count-field");
const $inputBtn = document.querySelector(".input-submit");
const $productList = document.querySelector(".product-list");
const $sortBtn = document.querySelectorAll(".sort-button");

function App() {
  this.supermarket = {
    vegetables: [],
    meat: [],
    milk: [],
    cookie: [],
    beverage: [],
  };

  this.currentCategory = "vegetables";

  this.init = async () => {
    render();
    initEventListeners();
  };

  const render = async (sortList = false) => {
    this.supermarket[this.currentCategory] =
      await ProductApi.getAllProductByCategory(this.currentCategory);

    let data = this.supermarket[this.currentCategory];
    if (sortList) data = sortList;
    const template = data
      .map((item) => {
        return `
            <li data-product-id="${item.id}" class="product-list-item">
              <div class="${item.isSoldOut ? "sold-out" : ""} product-detail">
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

  const checkRenderType = () => {
    let isSort = false;
    $sortBtn.forEach((btn) => {
      const flag = btn.classList.contains("sort-name");
      const type = flag ? "name" : "count";
      if (btn.classList.contains("is-active")) {
        isSort = true;
        sortProduct(type);
      }
    });
    return isSort;
  };

  const updateProductCount = () => {
    let productCount = 0;
    this.supermarket[this.currentCategory].map((item) => {
      if (!item.isSoldOut) productCount++;
    });
    $productCount.innerHTML = `${productCount}`;
  };

  const addProductName = async () => {
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

    await ProductApi.addProduct(
      this.currentCategory,
      productName,
      productCount
    );

    $inputNameField.value = "";
    $inputCountField.value = "";

    if (!checkRenderType()) render();
  };

  const editProductName = async (e) => {
    const productId = e.target.closest("li").dataset.productId;
    const $productName = e.target.closest("li").querySelector(".product-name");
    const productName = $productName.innerText;
    let updateProductName = prompt("상품명을 수정해주세요.", productName);
    if (updateProductName === null || updateProductName === "") return;

    let isDuplicate = this.supermarket[this.currentCategory].filter(
      (v) => v.name === updateProductName
    ).length;
    while (isDuplicate) {
      updateProductName = prompt(
        "이미 존재하는 상품명입니다. 다른 상품명으로 수정해주세요.",
        productName
      );
      isDuplicate = this.supermarket[this.currentCategory].filter(
        (v) => v.name === updateProductName
      ).length;
    }

    const { count } = this.supermarket[this.currentCategory].filter(
      (v) => v.id === productId
    )[0];

    await ProductApi.editProduct(
      this.currentCategory,
      updateProductName,
      count,
      productId
    );

    if (!checkRenderType()) render();
  };

  const deleteProductName = async (e) => {
    if (confirm("삭제하시겠습니까?")) {
      const productId = e.target.closest("li").dataset.productId;
      await ProductApi.deleteProduct(this.currentCategory, productId);

      if (!checkRenderType()) render();
    }
  };

  const soldOutProduct = async (e) => {
    const productId = e.target.closest("li").dataset.productId;
    await ProductApi.soldOutProduct(this.currentCategory, productId);
    const { name, count } = this.supermarket[this.currentCategory].filter(
      (v) => v.id === productId
    )[0];
    if (count) {
      await ProductApi.editProduct(this.currentCategory, name, 0, productId);
    } else {
      await ProductApi.editProduct(this.currentCategory, name, 1, productId);
    }

    if (!checkRenderType()) render();
  };

  const addProduct = async (e) => {
    const productId = e.target.closest("li").dataset.productId;
    const { name, count } = this.supermarket[this.currentCategory].filter(
      (v) => v.id === productId
    )[0];

    if (count === 0) soldOutProduct(e);

    await ProductApi.editProduct(
      this.currentCategory,
      name,
      count + 1,
      productId
    );

    if (!checkRenderType()) render();
  };

  const subProduct = async (e) => {
    const productId = e.target.closest("li").dataset.productId;

    const { name, count } = this.supermarket[this.currentCategory].filter(
      (v) => v.id === productId
    )[0];

    if (count === 0) return;
    if (count === 1) soldOutProduct(e);

    await ProductApi.editProduct(
      this.currentCategory,
      name,
      count - 1,
      productId
    );

    if (!checkRenderType()) render();
  };

  const sortProduct = async (standard) => {
    this.supermarket[this.currentCategory] =
      await ProductApi.getAllProductByCategory(this.currentCategory);

    let productList = [...this.supermarket[this.currentCategory]];
    if (standard === "name") {
      productList.sort((a, b) => {
        let x = a.name;
        let y = b.name;
        return x.localeCompare(y);
      });
    } else {
      productList.sort((a, b) => a.count - b.count);
    }
    render(productList);
  };

  const changeCategory = (e) => {
    const isCategoryBtn = e.target.classList.contains("market-category-name");
    if (isCategoryBtn) {
      const categoryName = e.target.closest("button").dataset.categoryName;
      const categoryTitle = e.target.innerText;
      this.currentCategory = categoryName;
      $categoryTitle.innerText = categoryTitle;
      if (!checkRenderType()) render();
    }
  };

  const initEventListeners = () => {
    $inputBtn.addEventListener("click", addProductName);

    $inputCountField.addEventListener("keypress", (e) => {
      if ($inputNameField.value.trim() === "") return;
      if (e.key !== "Enter") return;
      addProductName();
      $inputNameField.focus();
    });

    $sortBtn.forEach((btn) => {
      btn.addEventListener("click", () => {
        const flag = btn.classList.contains("sort-name");
        const type = flag ? "name" : "count";
        btn.classList.toggle("is-active");
        if (btn.classList.contains("is-active")) sortProduct(type);
        else render();
      });
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

    $categoryBtn.addEventListener("click", changeCategory);
  };
}

const app = new App();
app.init();
