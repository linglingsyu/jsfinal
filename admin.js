import { API } from './api.js'

const orderPageBody = document.querySelector('.orderPage-body')

const state = {
  categoryData: [],
  itemData: [],
  init() {
    this.getOrders()
  },
  getOrders() {
    API.get('/orders').then((res) => {
      const data = res.data.orders
      // console.log(data)

      const categoryData = data.reduce((prev, current) => {
        for (const item of current.products) {
          if (!prev[item.category]) {
            prev[item.category] = 0
          }
          prev[item.category]++
        }
        return prev
      }, {})
      for (const [key, value] of Object.entries(categoryData)) {
        let tmp = []
        tmp.push(key)
        tmp.push(value)
        this.categoryData.push(tmp)
      }

      const itemData = data.reduce((prev, current) => {
        for (const item of current.products) {
          if (!prev[item.title]) {
            prev[item.title] = 0
          }
          prev[item.title]++
        }
        // console.log(current)
        return prev
      }, {})
      for (const [key, value] of Object.entries(itemData)) {
        let tmp = []
        tmp.push(key)
        tmp.push(value)
        this.itemData.push(tmp)
      }

      // console.log(this.categoryData)
      // console.log(this.itemData)
      this.RenderOrders(data)
      this.initChart('#chart', this.categoryData)
    })
  },
  RenderOrders(data) {
    orderPageBody.innerHTML = ''
    for (const item of data) {
      const dom = this.OrderTemplate(item)
      orderPageBody.insertAdjacentHTML('afterbegin', dom)
    }
    this.bindEvent()
  },
  updateOrderStatus(data) {
    console.log(data)
    API.put('/orders', data).then((res) => {
      const response = res.data.orders
      console.log(response)
      Swal.fire('訂單狀態已更新!', '', 'success')
      this.RenderOrders(response)
    })
  },
  DeleteOrder(id) {
    Swal.fire({
      title: 'Are you sure?',
      text: '確定要刪除' + id + '嗎？',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '對，刪掉！',
    }).then((result) => {
      if (result.isConfirmed) {
        API.delete('/orders/' + id).then((res) => {
          const data = res.data
          if (data.status) {
            Swal.fire('如你所願!', '已經刪除囉～', 'success')
            this.RenderOrders(data.orders)
          }
        })
      }
    })
  },
  bindEvent() {
    const that = this
    const discardBtn = document.querySelectorAll('.delSingleOrder-Btn')
    for (const btn of discardBtn) {
      btn.addEventListener('click', function (e) {
        const id = e.target.dataset.id
        if (id !== undefined) {
          e.preventDefault()
          that.DeleteOrder(id)
        }
      })
    }

    const orderStatus = document.querySelectorAll('.orderStatus')
    for (const btn of orderStatus) {
      btn.addEventListener('click', function (e) {
        const id = e.target.dataset.id
        const paid = e.target.dataset.paid === 'false' ? false : true
        const data = {
          data: {
            id: id,
            paid: paid,
          },
        }
        if (id !== undefined) {
          e.preventDefault()
          that.updateOrderStatus(data)
        }
      })
    }
  },
  initChart(ele, data) {
    // C3.js
    console.log(ele)
    console.log(data)
    c3.generate({
      bindto: ele, // HTML 元素綁定
      data: {
        type: 'pie',
        columns: data,
        // colors: {
        //   'Louvre 雙人床架': '#DACBFF',
        //   'Antony 雙人床架': '#9D7FEA',
        //   'Anty 雙人床架': '#5434A7',
        //   其他: '#301E5F',
        // },
      },
    })
  },
  OrderTemplate(data) {
    let OrderItem = ''
    for (const item of data.products) {
      OrderItem += `<p>${item.title} * ${item.quantity}</p>`
    }
    return ` <tr>
    <td>${data.id}</td>
    <td>
      <p>${data.user.name}</p>
      <p>${data.user.tel}</p>
    </td>
    <td>${data.user.address}</td>
    <td>${data.user.email}</td>
    <td>
      ${OrderItem}
    </td>
    <td>${dayjs.unix(data.createdAt).format('YYYY-MM-DD')}</td>
    <td class="orderStatus">
      <a href="#" data-id="${data.id}" data-paid="${!data.paid}">${
      data.paid ? '已處理' : '未處理'
    }</a>
    </td>
    <td>
      <input type="button" data-id="${
        data.id
      }" class="delSingleOrder-Btn" value="刪除" />
    </td>
  </tr>`
  },
}

state.init()
