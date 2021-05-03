import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { deleteUser, updateUser } from '../../actions/profileActions';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import TextFieldGroup from '../common/TextFieldGroup';

class TableComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            name: "",
            email: "",
            id: "",
            current: false,
            description: '',
            errors: {},
            disabled: false
        }

        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.errors) {
            this.setState({ errors: nextProps.errors });
        }
    }

    onDeleteClick(id) {
        this.props.deleteUser(id);
    }

    toggle = (id) => {
        this.setState({ open: !this.state.open });
        if (id) {
            const { list } = this.props;
            const selectUser = list.filter((val) => val._id === id);
            console.log('sele', selectUser)
            if (selectUser && selectUser.length > 0) {
                this.setState({ name: selectUser[0].name, email: selectUser[0].email, id: selectUser[0]._id });
            }
        }
        else {
            this.setState({ name: '', email: '', id: '' });
        }
    }

    onChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    onSubmit = (e) => {
        e.preventDefault();
        const data = {
            name: this.state.name,
            email: this.state.email,
            id: this.state.id
        }
        this.props.updateUser(data);
        this.toggle();
    }

    render() {
        const { list } = this.props;
        const { errors } = this.state;
        let modal = (
            <div>
                <Modal isOpen={this.state.open} toggle={() => this.toggle()} >
                    <ModalHeader toggle={() => this.toggle()}>Update User</ModalHeader>
                    <form onSubmit={this.onSubmit}>
                        <ModalBody>
                            <TextFieldGroup
                                placeholder="* Name"
                                name="name"
                                value={this.state.name}
                                onChange={this.onChange}
                                error={errors.name}
                            />
                            <TextFieldGroup
                                placeholder="* Email"
                                name="email"
                                value={this.state.email}
                                onChange={this.onChange}
                                error={errors.email}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button type="submit" color="primary" >Save</Button>{' '}
                            <Button color="secondary" onClick={() => this.toggle()}>Cancel</Button>
                        </ModalFooter>
                    </form>
                </Modal>
            </div>
        )

        return (
            <div>
                {modal}
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
                                        <span style={{ cursor: 'pointer' }} onClick={() => this.toggle(val._id)}>
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
    deleteUser: PropTypes.func.isRequired,
    updateUser: PropTypes.func.isRequired
};

export default connect(null, { deleteUser, updateUser })(TableComponent);
