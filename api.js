const BASE_URL = "http://localhost:3000";

const HTTP_METHOD = {
  POST(data) {
    return {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
  },
  PUT(data) {
    return {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : null,
    };
  },
  DELETE() {
    return {
      method: "DELETE",
    };
  },
};

const request = async (url, option) => {
  const res = await fetch(url, option);
  if (!res.ok) {
    alert("에러가 발생했습니다.");
  }
  return res.json();
};

const requestWithoutJson = async (url, option) => {
  const res = await fetch(url, option);
  if (!res.ok) {
    alert("에러가 발생했습니다.");
  }
  return res;
};

const ProductApi = {
  getAllProductByCategory(category) {
    return request(`${BASE_URL}/api/category/${category}/menu`);
  },
  addProduct(category, name, count) {
    return request(
      `${BASE_URL}/api/category/${category}/menu`,
      HTTP_METHOD.POST({ name, count })
    );
  },
  editProduct(category, name, count, productId) {
    return request(
      `${BASE_URL}/api/category/${category}/menu/${productId}`,
      HTTP_METHOD.PUT({ name, count })
    );
  },
  soldOutProduct(category, productId) {
    return request(
      `${BASE_URL}/api/category/${category}/menu/${productId}/soldout`,
      HTTP_METHOD.PUT()
    );
  },
  deleteProduct(category, productId) {
    return requestWithoutJson(
      `${BASE_URL}/api/category/${category}/menu/${productId}`,
      HTTP_METHOD.DELETE()
    );
  },
};

export default ProductApi;
