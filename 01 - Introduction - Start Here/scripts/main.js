var React = require('react')
var ReactDOM = require('react-dom')

var ReactRouter = require('react-router')
var Router = ReactRouter.Router,
    Route = ReactRouter.Route,
    browserHistory = ReactRouter.browserHistory,
    Navigation = ReactRouter.Navigation// MIXIN,
    History = ReactRouter.History

var h = require('./helpers')

var Catalyst = require('react-catalyst')

// Fire Base
var rebase = require('re-base')
var base = rebase.createClass({
  apiKey: "ysd9F9y4Eeoc1mgcurN65ngDUBsYjdIGAZxE9WP2",
  authDomain: "online-store-24885.firebaseapp.com",
  databaseURL: "https://online-store-24885.firebaseio.com",
  storageBucket: "online-store-24885.appspot.com",

})


// var browserHistory = require('history/lib/createBrowserHistory')// This is a function I am just executing here stead of 86L


// App component
var App = React.createClass({
  mixins : [Catalyst.LinkedStateMixin],
  getInitialState : function(){
    return{
      fishes : {},
      orders : {}
    }
  },
  componentDidMount :function(){
    base.syncState(this.props.params.storeId + '/fishes', {
      context : this,
      state : 'fishes'
    })

    var localStorageRef = localStorage.getItem('order-' + this.props.params.storeId)
    if (localStorageRef){
      this.setState({
        orders : JSON.parse(localStorageRef)
      })
    }
  },
  componentWillUpdate :function(nextProps, nextState){
// <<<<<<< HEAD
//     var item = ('order-' + this.props.params.storeId, JSON.stringify(nextState.order))
//     console.log(nextState.order)
//     localStorage.setItem('order-' + this.props.params.storeId, JSON.stringify(nextState.order))
// =======
    var item = ('order-' + this.props.params.storeId, JSON.stringify(nextState.orders))
    localStorage.setItem('order-' + this.props.params.storeId, JSON.stringify(nextState.orders))
  },
  addFish : function(fish){
    var timestamp = new Date().getTime()
    this.state.fishes['fish-' + timestamp] = fish
    this.setState({ fishes : this.state.fishes })
  },
  removeFish(key){

    if (confirm("Are you sure you want to remove it")){
      this.state.fishes[key] = null
      this.setState({
        fishes : this.state.fishes
      })
    }
  },
  removeFromOrder(key){

    if (confirm("Are you sure you want to remove it")){
      delete this.state.orders[key]
      this.setState({
        orders : this.state.orders
      })
    }
  },
  addOrder : function(fish){
    this.state.orders[fish] = this.state.orders[fish]+1 || 1
    this.setState({ orders: this.state.orders })
  },
  loadSamples : function(){
    this.setState({ fishes : require('./sample-fishes')})
  },
  renderFish: function(key){
    return <Fish key={key} index={key} details={this.state.fishes[key]} addOrder={this.addOrder}/>
  },
  render : function(){
    return (
      <div className='catch-of-the-day'>
        <div className='menu'>
          <Header tagline='Lo mejor en desarmadores' />
          <ul className='list-of-fishes'>
            {Object.keys(this.state.fishes).map(this.renderFish)}
          </ul>
        </div>
        <Order fishes={this.state.fishes} orders={this.state.orders} removeFromOrder={this.removeFromOrder}/>
        <Inventory addFish={this.addFish} loadSamples={this.loadSamples} fishes={this.state.fishes} linkState = {this.linkState} removeFish = {this.removeFish}/>
      </div>
    )
  }
})

// Header component

var Header = React.createClass({
  render : function(){
    return (
      <header className='top'>
        <h1>Ferreteria</h1>
        <h3 className='tagline'><span>{this.props.tagline}</span></h3>
      </header>
    )
  }
})

// Order component
var Order = React.createClass({
  renderOrderItems:function(key){
    var order = this.props.orders[key]
    var fish = this.props.fishes[key]
    var removeButton = <button onClick={this.props.removeFromOrder.bind(null, key)}>x</button>
    if (!fish){
      return (
        <li key={key}>Producto agotado!{removeButton}</li>

      )

    }

    return (
      <li key = {key}>
      {order} pza
       {fish.name}
      <span className='price'>{h.formatPrice(order * fish.price)}</span>
      {removeButton}
      </li>
    )

  },

  render : function(){
      var orders = this.props.orders
      var fishes = this.props.fishes
      var ordersKeys = Object.keys(orders)

      var total = ordersKeys.reduce((p, k)=>{

        var fish = fishes[k]
        var count = orders[k]
        var isAvailabe = fish && fish.status === 'available'
        if(fish && isAvailabe){
          return p + (count * parseInt(fish.price) || 0)
        }
        return p
      },0)
      return (
        <div className='order-wrap'>
          <h2 className='order-title'>Tu orden</h2>
          <ul className='order'>
            { ordersKeys.map(this.renderOrderItems) /* Every time it is render, render the list of items*/}
            <li className='total'>
              <strong>Total:</strong>
              {h.formatPrice(total)}
            </li>
          </ul>
        </div>
      )
  }
})

// Inventory
var Inventory = React.createClass({
  renderInventory (key){
    var linkState = this.props.linkState
    return(
      <div className='fish-edit' key = {key}>
        <input type='text' valueLink={linkState('fishes.'+ key +'.name')}/>
        <input type='text' valueLink={linkState('fishes.'+ key +'.price')}/>
        <select valueLink={linkState('fishes.'+ key +'.status')}>
          <option value='unavailable'>Agotado!</option>
          <option value='available'>Fresh!</option>
        </select>
        <textarea valueLink={linkState('fishes.'+ key +'.desc')}></textarea>
        <input type='text' valueLink={linkState('fishes.'+ key +'.image')}/>
        <button onClick={this.props.removeFish.bind(null, key)}>Eliminar </button>
      </div>
    )
  },
  render : function(){
    return (
      <div>
        <h2>Inventario</h2>
        {
        Object.keys(this.props.fishes).map(this.renderInventory)
      }
        <AddFishForm {...this.props} />
        <button onClick={this.props.loadSamples}>Cargar datos exemplo</button>
      </div>
    )
  }
})

// We will start with StorePiker

var StorePiker = React.createClass({
  goToStore : function(event){
    event.preventDefault()
    var storeId = this.refs.storeId.value
    browserHistory.push('/store/' + storeId)
  },
  render : function(){
    return(
      <form className='store-selector' onSubmit={this.goToStore}>
        <h2>Pick a store</h2>
        <input type='text' ref='storeId' defaultValue={h.getFunName()} required/>
        <input type='Submit'/>
      </form>
    )
  }
})

// Add fish form

var AddFishForm = React.createClass({
  createFish : function(event){
    event.preventDefault()
    var fish = {
      name : this.refs.name.value,
      price : this.refs.price.value,
      status : this.refs.status.value,
      desc : this.refs.desc.value,
      image : this.refs.image.value,
    }
    this.props.addFish(fish)
    this.refs.form.reset()

  },
  render : function(){
    return (
      <form className='fish-edit' ref='form' onSubmit={this.createFish}>
        <input type='text' ref='name' placeholder='Nombre'/>
        <input type='text' ref='price' placeholder='Precio'/>
        <select ref = 'status'>
          <option value='available'>Nuevo!</option>
          <option value='unavailable'>Agotado</option>
        </select>
        <textarea type='text' ref='desc' placeholder='Descripcion'></textarea>
        <input type='text' ref='image' placeholder='Imagen'/>
        <button type='submit'> + Agregar Producto </button>
      </form>
    )
  }
})

var Fish = React.createClass({
  placeOrder : function(){
    this.props.addOrder(this.props.index)
  },
  render : function(){
    var fish = this.props.details
    var isAvailabe = (fish.status == 'available' ? true : false)
    var btnText = (isAvailabe == true ? 'Comprar' : 'Agotado')

    return(
      <li className='menu-fish'>
        <img src={fish.image} alt={fish.name}/>
        <h3 className='fish-name'>
          {fish.name}
          <span className='price'>{h.formatPrice(fish.price)}</span>
        </h3>
        <p>{fish.desc}</p>
        <button onClick={this.placeOrder} disabled={!isAvailabe}>{btnText}</button>
      </li>
    )
  }
})

var NotFound = React.createClass({
  render: function(){
    return (
      <h1> Can not touch </h1>
    )
  }
})
// Routes
var routes = (
  <Router history={browserHistory}>
    <Route path='/' component={StorePiker}/>
    <Route path='/store/:storeId' component={App}/>
    <Route path='*' component={NotFound}/>
  </Router>
)

ReactDOM.render(routes, document.querySelector('#main'))
