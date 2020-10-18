import { Component } from 'react'
import io from 'socket.io-client'

class Medium extends Component {
	constructor(...args) {
		super(...args)
		this.state = {
			hello: '',
		}
	}

	componentDidMount() {
		this.socket = io()
		this.socket.on('now', data => {
			this.setState({
				hello: data.message,
			})
		})
	}

	render() {
		return (
			<h1>{this.state.hello}</h1>
		)
	}
}

export default Medium
