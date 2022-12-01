const BASE_URL =
  'https://livejs-api.hexschool.io/api/livejs/v1/customer/elsasyu'

const API = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

const productWrap = document.querySelector('.productWrap')

const state = {
  ProductTemplate(data) {
    return `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img
      src="${data.images}"
    />
    <a href="#" class="addCardBtn">加入購物車</a>
    <h3>${data.title}</h3>
    <del class="originPrice">NT$${data.origin_price}</del>
    <p class="nowPrice">NT$${data.price}</p>
  </li>`
  },
  getProducts() {
    API.get('/products').then((res) => {
      const data = res.data.products
      console.log(data)
      this.ProductsRender(data)
    })
  },
  ProductsRender(data) {
    for (const item of data) {
      const dom = this.ProductTemplate(item)
      productWrap.insertAdjacentHTML('afterbegin', dom)
    }
  },
}

state.getProducts()
