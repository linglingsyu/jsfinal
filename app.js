const BASE_URL =
  'https://livejs-api.hexschool.io/api/livejs/v1/customer/elsasyu'

const API = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

const productWrap = document.querySelector('.productWrap')
const shoppingCartBody = document.querySelector('.shoppingCart-body')
const total = document.querySelector('.total')
const discardAllBtn = document.querySelector('.discardAllBtn')

const state = {
  addCartsList: {},
  init() {
    this.getProducts()
    this.getCart()
    discardAllBtn.addEventListener('click', this.DeleteCarts)
  },
  ProductTemplate(data) {
    return `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img
      src="${data.images}"
    />
    <a href="#" class="addCardBtn" data-id="${data.id}">加入購物車</a>
    <h3>${data.title}</h3>
    <del class="originPrice">NT$${this.formatNumber(data.origin_price)}</del>
    <p class="nowPrice">NT$${this.formatNumber(data.price)}</p>
  </li>`
  },
  CartTemplate(data, quantity) {
    return ` <tr>
    <td>
      <div class="cardItem-title">
        <img src="${data.images}" />
        <p>${data.title}</p>
      </div>
    </td>
    <td>NT$${this.formatNumber(data.origin_price)}</td>
    <td>${quantity}</td>
    <td>NT$${this.formatNumber(data.price)}</td>
    <td class="discardBtn">
      <a href="#" class="material-icons" data-id="${data.id}"> clear </a>
    </td>
  </tr>`
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
    this.bindAddCart()
  },
  bindAddCart() {
    const addCardBtn = document.querySelectorAll('.addCardBtn')
    const that = this
    for (const item of addCardBtn) {
      item.addEventListener('click', function (e) {
        e.preventDefault()
        const id = e.target.dataset.id
        that.addCart(id)
        console.log(e.target)
      })
    }
  },
  addCart(id) {
    if (!this.addCartsList[id]) {
      this.addCartsList[id] = 1
    } else {
      this.addCartsList[id]++
    }
    const data = {
      data: {
        productId: id,
        quantity: this.addCartsList[id],
      },
    }
    API.post('/carts', data).then((res) => this.CartRender(res.data.carts))
    // console.log(this.addCartsList)
  },
  getCart() {
    API.get('/carts').then((res) => {
      const data = res.data.carts
      this.CartRender(data)
      // console.log(data)
    })
  },
  CartRender(data) {
    let PriceTotal = 0
    shoppingCartBody.innerHTML = ''
    for (const item of data) {
      PriceTotal += item.product.price
      const dom = this.CartTemplate(item.product, item.quantity)
      shoppingCartBody.insertAdjacentHTML('afterbegin', dom)
    }
    if (data.length > 0) total.textContent = this.formatNumber(PriceTotal)
    else total.textContent = 0
    // console.log(total)
  },
  DeleteCarts(e) {
    e.preventDefault()
    API.delete('/carts').then((res) => {
      if (res.status) state.CartRender(res.data.carts)
    })
  },
  DeleteCart(id) {},
  formatNumber(num) {
    return numeral(num).format('0,0') // '1,000'
  },
}

state.init()
