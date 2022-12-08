import { API } from './api.js'

const orderPageBody = document.querySelector('.orderPage-body')
const discardAllBtn = document.querySelector('.discardAllBtn')

const state = {
  chart: [],
  categoryData: [],
  itemData: [],
  init() {
    const that = this
    that.getOrders()
    discardAllBtn.addEventListener('click', that.DeleteCarts)
  },
  getOrders() {
    API.get('/orders').then((res) => {
      const data = res.data.orders
      // console.log(data)
      this.RenderOrders(data)
    })
  },
  RenderOrders(data) {
    if (data.length === 0) {
      orderPageBody.innerHTML =
        '<tr><td colspan="8" style="text-align:center">目前沒有訂單唷~</td></tr>'
    } else {
      orderPageBody.innerHTML = ''
    }
    for (const item of data) {
      const dom = this.OrderTemplate(item)
      orderPageBody.insertAdjacentHTML('afterbegin', dom)
    }
    this.bindEvent()

    const categoryData = data.reduce((prev, current) => {
      for (const item of current.products) {
        if (!prev[item.category]) {
          prev[item.category] = 0
        }
        prev[item.category] += item.quantity
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
        prev[item.title] += item.quantity
      }
      // console.log(current)
      return prev
    }, {})

    const sortable = []
    for (const [key, val] of Object.entries(itemData)) {
      sortable.push([key, val])
    }
    sortable.sort(function (a, b) {
      return b[1] - a[1]
    })

    if (sortable.length > 0) {
      let othersCount = 0
      for (const item of sortable) {
        if (this.itemData.length < 3) {
          this.itemData.push(item)
        } else {
          othersCount += item[1]
        }
      }
      if (othersCount > 0) {
        this.itemData.push(['其他', othersCount])
      }
    }

    this.initChart('#chart', this.categoryData)
    this.initChart('#chart2', this.itemData)
  },
  updateOrderStatus(data) {
    console.log(data)
    API.put('/orders', data).then((res) => {
      const response = res.data.orders
      console.log(response)
      Swal.fire({
        title: '訂單狀態已更新！',
        icon: 'success',
        timer: 1200,
        timerProgressBar: true,
        html: '<strong></strong> 秒後關閉<br/><br/>',
        didOpen: () => {
          Swal.showLoading()
          timerInterval = setInterval(() => {
            Swal.getHtmlContainer().querySelector('strong').textContent = (
              Swal.getTimerLeft() / 1000
            ).toFixed(0)
          }, 100)
        },
      }).then((res) => location.reload())
      // this.RenderOrders(response)
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
            Swal.fire({
              title: '訂單已刪除！',
              icon: 'success',
              timer: 1200,
              timerProgressBar: true,
              html: '<strong></strong> 秒後關閉<br/><br/>',
              didOpen: () => {
                Swal.showLoading()
                timerInterval = setInterval(() => {
                  Swal.getHtmlContainer().querySelector('strong').textContent =
                    (Swal.getTimerLeft() / 1000).toFixed(0)
                }, 100)
              },
            }).then((res) => location.reload())
            // this.RenderOrders(data.orders)
          }
        })
      }
    })
  },
  DeleteCarts(e) {
    e.preventDefault()
    Swal.fire({
      title: 'Are you sure?',
      text: '您將刪除全部訂單',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '對，刪掉！',
    }).then((result) => {
      if (result.isConfirmed) {
        API.delete('/orders').then((res) => {
          if (res.status) {
            Swal.fire({
              title: '刪除成功！',
              icon: 'success',
              timer: 2000,
              timerProgressBar: true,
              html: 'I will close in <strong></strong> seconds.<br/><br/>',
              didOpen: () => {
                Swal.showLoading()
                timerInterval = setInterval(() => {
                  Swal.getHtmlContainer().querySelector('strong').textContent =
                    (Swal.getTimerLeft() / 1000).toFixed(0)
                }, 100)
              },
            }).then((res) => location.reload())
            // state.RenderOrders(res.data.orders)
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
    this.chart.push(
      c3.generate({
        bindto: ele, // HTML 元素綁定
        data: {
          type: 'pie',
          columns: data,
          order: null,
          // colors: {
          //   'Louvre 雙人床架': '#DACBFF',
          //   'Antony 雙人床架': '#9D7FEA',
          //   'Anty 雙人床架': '#5434A7',
          //   其他: '#301E5F',
          // },
        },
      })
    )
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
