import { API } from './api.js'
// const BASE_URL =
//   'https://livejs-api.hexschool.io/api/livejs/v1/customer/elsasyu'

// const API = axios.create({
//   baseURL: BASE_URL,
//   headers: { 'Content-Type': 'application/json' },
// })

const productWrap = document.querySelector('.productWrap')
const shoppingCartBody = document.querySelector('.shoppingCart-body')
const total = document.querySelector('.total')
const discardAllBtn = document.querySelector('.discardAllBtn')
const orderInfoForm = document.querySelector('#form')
const productSelect = document.querySelector('.productSelect')
const orderInfoMessage = document.querySelectorAll('.orderInfo-message')

const constraints = {
  customerName: {
    presence: {
      message: ' 必填',
    },
  },
  customerPhone: {
    presence: {
      message: ' 必填',
    },
  },
  Email: {
    presence: {
      message: ' 必填',
    },
    email: true,
  },
  customerAddress: {
    presence: {
      message: ' 必填',
    },
  },
  tradeWay: {
    presence: {
      message: ' 必填',
    },
  },
}

const state = {
  data: null,
  addCartsList: {},
  init() {
    const that = this
    that.getProducts()
    that.getCart()
    discardAllBtn.addEventListener('click', that.DeleteCarts)
    productSelect.addEventListener('change', that.filterProducts)
    orderInfoForm.addEventListener('submit', function (e) {
      e.preventDefault()
      that.addOrder()
    })
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
  CartTemplate(cartID, data, quantity) {
    const price = data.price * quantity
    return ` <tr>
    <td>
      <div class="cardItem-title">
        <img src="${data.images}" />
        <p>${data.title}</p>
      </div>
    </td>
    <td>NT$${this.formatNumber(data.price)}</td>
    <td>${quantity}</td>
    <td>NT$${this.formatNumber(price)}</td>
    <td class="discardBtn">
      <a href="#" class="material-icons" data-id="${cartID}"> clear </a>
    </td>
  </tr>`
  },
  getProducts() {
    // const that = this
    API.get('/products').then((res) => {
      const data = res.data.products
      this.data = data
      // console.log(this)
      this.ProductsRender(data)
    })
  },
  ProductsRender(data) {
    productWrap.innerHTML = ''
    for (const item of data) {
      const dom = this.ProductTemplate(item)
      productWrap.insertAdjacentHTML('afterbegin', dom)
    }
    this.bindAddCart()
  },
  filterProducts() {
    if (productSelect.value === '全部') {
      state.ProductsRender(state.data)
    } else {
      const data = state.data.filter(
        (item) => item.category === productSelect.value
      )
      state.ProductsRender(data)
    }
  },
  bindAddCart() {
    const addCardBtn = document.querySelectorAll('.addCardBtn')
    const that = this
    for (const item of addCardBtn) {
      item.addEventListener('click', function (e) {
        e.preventDefault()
        const id = e.target.dataset.id
        that.addCart(id)
        // console.log(e.target)
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
    // console.log(data)
    let PriceTotal = 0
    shoppingCartBody.innerHTML = ''
    for (const item of data) {
      PriceTotal += item.product.price * item.quantity
      const dom = this.CartTemplate(item.id, item.product, item.quantity)
      shoppingCartBody.insertAdjacentHTML('afterbegin', dom)
    }
    if (data.length > 0) total.textContent = this.formatNumber(PriceTotal)
    else total.textContent = 0
    // console.log(total)
    this.bindDelCart()
  },
  bindDelCart() {
    const that = this
    const discardBtn = document.querySelectorAll('.discardBtn')
    for (const btn of discardBtn) {
      btn.addEventListener('click', function (e) {
        const id = e.target.dataset.id
        if (id !== undefined) {
          e.preventDefault()
          that.DeleteCart(id)
        }
      })
    }
  },
  DeleteCarts(e) {
    e.preventDefault()
    Swal.fire({
      title: 'Are you sure?',
      text: '您將刪除所有品項',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '對，刪掉！',
    }).then((result) => {
      if (result.isConfirmed) {
        API.delete('/carts').then((res) => {
          if (res.status) {
            Swal.fire('如你所願!', '已經刪除囉～', 'success')
            state.CartRender(res.data.carts)
          }
        })
      }
    })
  },
  DeleteCart(id) {
    API.delete('/carts/' + id).then((res) => {
      // console.log(res.data)
      const data = res.data
      if (data.status) {
        this.CartRender(res.data.carts)
      }
    })
  },
  addOrder() {
    const errors = validate(orderInfoForm, constraints)
    this.showErrorMessage(errors)
    if (!errors) {
      const formData = validate.collectFormValues(orderInfoForm)
      const data = {
        data: {
          user: {
            name: formData.customerName,
            tel: formData.customerPhone,
            email: formData.Email,
            address: formData.customerAddress,
            payment: formData.tradeWay,
          },
        },
      }
      API.post('/orders', data).then((res) => {
        // console.log(res.data)
        const data = res.data
        if (data.status) {
          Swal.fire({
            title: 'success!',
            text: '送出訂單成功',
            icon: 'success',
            confirmButtonText: '太棒了',
            // timer: 3000,
            // timerProgressBar: true,
            // afterConfirm: () => {
            //   location.reload()
            // },
          })

          orderInfoForm.reset()
          shoppingCartBody.innerHTML = ''
          total.textContent = 0
        } else {
          Swal.fire({
            title: 'Error!',
            text: '送出訂單失敗',
            icon: 'error',
            confirmButtonText: '請重新嘗試',
          })
        }
      })
    }

    // console.log(formData)
    // const data = {
    //   data: {
    //     user: {
    //       name: formData.get('customerName'),
    //       tel: formData.get('customerPhone'),
    //       email: formData.get('Email'),
    //       address: formData.get('customerAddress'),
    //       payment: formData.get('tradeWay'),
    //     },
    //   },
    // }
    // console.log(data)
  },
  formatNumber(num) {
    return numeral(num).format('0,0') // '1,000'
  },
  showErrorMessage(errors) {
    for (const item of orderInfoMessage) {
      const ele = item.dataset.message
      item.textContent = ''
      if (errors) {
        for (const [key, val] of Object.entries(errors)) {
          if (key === ele) item.textContent = val
        }
      }
    }
  },
}

state.init()
