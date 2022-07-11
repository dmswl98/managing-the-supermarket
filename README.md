# 싱싱 마트 상품 관리하기

**Vanilla JS**

> **[Udemy 블랙커피 Vanilla JS Lv1. 문벅스 카페 메뉴 앱 만들기](https://github.com/blackcoffee-study/moonbucks-menu)** 를 수강 후 복습을 위해 실습한 내용입니다.

## 🖊️ [이전 프로젝트](https://github.com/dmswl98/todo-list)에서 개선한 점

- localStorage에 저장된 데이터에 의존했던 프로젝트를 서버로부터 제공되는 데이터에 의존하는 서비스로 개선하였습니다.
- 강의 내용과 다르게 추가로 각 상품의 재고 수를 기록하도록 기능을 추가하였습니다.
- 또한, 상품명과 재고 수에 따른 정렬 기능을 추가하였습니다.

## ⚙️ 서버 실행

1. 저장소를 local에 clone 해줍니다.

```
git clone https://github.com/blackcoffee-study/moonbucks-menu-server.git
```

2. 저장소를 clone한 후 아래 명령어를 입력해 의존성 라이브러리를 설치해줍니다.

```
npm install
```

3. 아래 명령어를 이용해 서버를 동작시킵니다.

```
npm start
```

## ⌨️ 서버 코드 수정

1. count 속성 추가

```javascript
// 📁 menu > menuItem.js
function menuItem(name, count) {
  this.id = nanoid();
  this.name = name;
  this.count = count;
  this.isSoldOut = false;
}
```

2. 입력으로 받은 count값도 서버에 저장되도록 수정

```javascript
// 📁 routes > index.js
// 메뉴 추가
router.post("/category/:category/menu", async (req, res) => {
  const { category } = req.params;
  const { name } = req.body;
  const { count } = req.body;

  // 생략
  try {
    const newMenuItem = new menuItem(name, count);
    menuStore.createMenuItem(category, newMenuItem);
    res.status(200).json(newMenuItem);
  } catch (e) {
    // 생략
  }
});

// 메뉴 이름 수정
router.put("/category/:category/menu/:menuId", async (req, res) => {
  const { category, menuId } = req.params;
  const { name } = req.body;
  const { count } = req.body;

  // 생략
  try {
    menuStore.updateMenuItem(category, menuId, name, count);
    const updatedMenu = menuStore.getByMenuId(category, menuId);
    res.status(200).json(updatedMenu);
  } catch (e) {
    // 생략
  }
});

// 메뉴 솔드 아웃
router.put("/category/:category/menu/:menuId/soldout", async (req, res) => {
  const { category, menuId } = req.params;
  const { name } = req.body;
  const { count } = req.body;

  // 생략
  try {
    menuStore.toggleSoldOutMenuItem(category, menuId, count);
    const updatedMenu = menuStore.getByMenuId(category, menuId);
    res.status(200).json(updatedMenu);
  } catch (e) {
    // 생략
  }
});
```

3. 객체 속성명 수정 및 상품별 재고 수 업데이트 함수 수정

```javascript
// 📁 store > index.js
function Store() {
  this.menuBoard = {
    vegetables: [],
    meat: [],
    milk: [],
    cookie: [],
    beverage: [],
  };
  // 생략
}
```

```javascript
// 📁 store > index.js
this.updateMenuItem = (category, menuId, name, count) => {
  this.menuBoard[category].find((item) => item.id === menuId).name = name;
  this.menuBoard[category].find((item) => item.id === menuId).count = count;
};
```
