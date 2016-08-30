var React = require('react')
var ReactDOM = require('react-dom')

var ReactRouter = require('react-router')
var Router = ReactRouter.Router,
    Route = ReactRouter.Route,
    browserHistory = ReactRouter.browserHistory,
    Navigation = ReactRouter.Navigation// MIXIN,
    History = ReactRouter.History

var h = require('./helpers')


// var browserHistory = require('history/lib/createBrowserHistory')// This is a function I am just executing here stead of 86L


// App component

var App = React.createClass({
  getInitialState : function(){
    return{
      fishes : {},
      orders : {}
    }
  },
  addFish : function(fish){
    var timestamp = new Date().getTime()
    this.state.fishes['fish-' + timestamp] = fish
    this.setState({ fishes : this.state.fishes })
  },addOrder : function(fish){
    this.state.orders[fish] = this.state.orders[fish]+1 || 1
    this.setState({ orders: this.state.orders })
    console.log(this.state.orders)
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
          <Header tagline='Fresh Seafood Market' />
          <ul className='list-of-fishes'>
            {Object.keys(this.state.fishes).map(this.renderFish)}
          </ul>
        </div>
        <Order fishes={this.state.fishes} orders={this.state.orders}/>
        <Inventory addFish={this.addFish} loadSamples={this.loadSamples}/>
      </div>
    )
  }
})

// Header component

var Header = React.createClass({
  render : function(){
    return (
      <header className='top'>
        <h1>Catch
          <span className='ofThe'>
            <span className='of'>of</span>
            <span className='the'>the</span>
          </span>
          Day</h1>
        <h3 className='tagline'><span>{this.props.tagline}</span></h3>
      </header>
    )
  }
})

// Order component
var Order = React.createClass({
  createOrder : function(key){
    var orders = this.props.orders
    var fishes = this.props.fishes
    var ordersKeys = Object.keys(orders)

    var total = ordersKeys.reduce(function(p, k){
      console.log(p)
      var fish = fishes[k]
      var count = orders[k]
      if(fish){
        return p = (count * parseInt(fish.price) || 0)
      }
      return p
    })
    return (
      <div className='order-wrap'>
        <h2 className='order-title'>Your order</h2>
        <ul className='order'>
          <li className='total'>
            <strong>Total:</strong>
            {h.formatPrice(total)}
          </li>
        </ul>
      </div>
    )
  },
  render : function(){
    return (
      <ul>{Object.keys(this.props.orders).map(this.createOrder)}</ul>
    )
  }
})

// Inventory
var Inventory = React.createClass({
  render : function(){
    return (
      <div>
        <h2>Inventory</h2>
        <AddFishForm {...this.props} />
        <button onClick={this.props.loadSamples}>Load Sample fishes</button>
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
        <input type='text' ref='name' placeholder='Fish Name'/>
        <input type='text' ref='price' placeholder='Fish Price'/>
        <select ref = 'status'>
          <option value='available'>Fresh!</option>
          <option value='unavailable'>Sold Out</option>
        </select>
        <textarea type='text' ref='desc' placeholder='Desc'></textarea>
        <input type='text' ref='image' placeholder='URL to image'/>
        <button type='submit'> + Add Item </button>
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
    var btnText = (isAvailabe == true ? 'Add to cart' : 'Sold Out')

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

// 404 component
var NotFound = React.createClass({
  render: function(){
    return(
      <h1> Can't touch this.. </h1>
    )
  }
})

// Routes
var routes = (
  <Router history={browserHistory}>
    <Route path='/' component={StorePiker}/>
    <Route path='/store/:storeId' component={App}/>
    {/* <Route path='*' component={NotFound}/> */}
  </Router>
)

ReactDOM.render(routes, document.querySelector('#main'))
