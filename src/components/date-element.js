import React from 'react';

export default class DateElement extends React.Component {
  static propTypes = {
    actions: React.PropTypes.object.isRequired,
    currentDate: React.PropTypes.string,
    date: React.PropTypes.string.isRequired
  }

  constructor(props) {
    super(props);

    this.isActive.bind(this);
  }

  handleClick() {
    this.props.actions.setDateFilter(this.props.date);
  }

  isActive(date) {
    return (date == this.props.currentDate) ? 'active' : '';
  }

  render() {
    return (
      <li className={this.isActive(this.props.date)}>
        <button onClick={this.handleClick.bind(this)} className="button">
          <i className="fa fa-calendar-o"></i> {this.props.date}
        </button>
      </li>
    );
  }
}
