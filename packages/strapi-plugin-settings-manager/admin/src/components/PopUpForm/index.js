/**
*
* PopUpForm
*
*/

import React from 'react';
import { map } from 'lodash';
import WithFormSection from 'components/WithFormSection';
import styles from './styles.scss';

class PopUpForm extends React.Component { // eslint-disable-line react/prefer-stateless-function
  componentWillUnmount() {
    if (this.props.resetToggleDefaultConnection) this.props.resetToggleDefaultConnection();
  }

  render() {
    return (
      <div className={styles.popUpForm}>
        <div className="row">
          <div className="col-sm-12">
            <div className={styles.padded}>

              <div className="row">

                {map(this.props.sections, (section) => {
                  // custom rendering
                  if (this.props.renderPopUpForm) {
                    // Need to pass props to use this.props.renderInput from WithFormSection HOC
                    return this.props.renderPopUpForm(section, this.props, styles);
                  }
                  return (
                    map(section.items, (item, key) => (
                      this.props.renderInput(item, key)
                    ))
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

PopUpForm.propTypes = {
  renderInput: React.PropTypes.func.isRequired,
  renderPopUpForm: React.PropTypes.oneOfType([
    React.PropTypes.func,
    React.PropTypes.bool,
  ]).isRequired,
  resetToggleDefaultConnection: React.PropTypes.func.isRequired,
  sections: React.PropTypes.array.isRequired,
};

export default WithFormSection(PopUpForm); // eslint-disable-line new-cap
