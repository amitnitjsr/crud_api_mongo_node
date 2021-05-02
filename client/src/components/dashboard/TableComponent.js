import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { deleteUser } from '../../actions/profileActions';

class TableComponent extends Component {

    onDeleteClick(id) {
        this.props.deleteUser(id);
    }

    render() {
        const { list } = this.props;
        return (
            <div>
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th scope="col">Sr. no.</th>
                            <th scope="col">Name</th>
                            <th scope="col">Email</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list && list.length > 0 && list.map((val, index) => {
                            return (
                                <tr key={val._id}>
                                    <th scope="row">{index + 1}</th>
                                    <td>{val.name}</td>
                                    <td>{val.email}</td>
                                    <td>
                                        <span style={{ cursor: 'pointer' }} onClick={() => this.onDeleteClick(val._id)}>
                                            <i className="fas fa-trash-alt"></i>
                                        </span>&nbsp;&nbsp;&nbsp;
                                        <span style={{ cursor: 'pointer' }}>
                                            <i className="fas fa-edit"></i>
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        )
    }

}

TableComponent.propTypes = {
    deleteUser: PropTypes.func.isRequired
};

export default connect(null, { deleteUser })(TableComponent);

// export default TableComponent;