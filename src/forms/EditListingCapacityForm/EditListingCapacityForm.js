import React from 'react';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import classNames from 'classnames';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { FormattedMessage, intlShape } from '../../util/reactIntl';
import { required } from '../../util/validators';

import { propTypes } from '../../util/types';
import config from '../../config';
import { Form, Button, FieldSelect } from '../../components';

import css from './EditListingFeaturesForm.css';

const EditListingCapacityForm = props => (
    <FinalForm
        {...props}
        mutators={{ ...arrayMutators }}
        render={formRenderProps => {
            const {
                className,
                disabled,
                handleSubmit,
                intl,
                invalid,
                pristine,
                saveActionMsg,
                updated,
                updateError,
                updateInProgress,
                capacityOptions,
            } = formRenderProps;

            const capacityPlaceholder = 'placeholder'

            const errorMessage = updateError ? (
                <p className={css.error}>
                    <FormattedMessage id="EditListingCapacityForm.updateFailed" />
                </p>
            ) : null;

            // const capacityRequired = required(
            //     intl.formatMessage({
            //       id: 'EditListingCapacityForm.capacityRequired',
            //     })
            //   );

            const classes = classNames(css.root, className);
            const submitReady = updated && pristine;
            const submitInProgress = updateInProgress;
            const submitDisabled = invalid || disabled || submitInProgress;

            return (
                <Form className={classes} onSubmit={handleSubmit}>
                    {errorMessage}

                    <FieldSelect
                        className={css.capacity}
                        name="capacity"
                        id="capacity"
                        // validate={capacityRequired}
                    >
                        <option value="">{capacityPlaceholder}</option>
                        {capacityOptions.map(c => (
                            <option key={c.key} value={c.key}>
                                {c.label}
                            </option>
                        ))}
                    </FieldSelect>

                    <Button
                        className={css.submitButton}
                        type="submit"
                        inProgress={submitInProgress}
                        disabled={submitDisabled}
                        ready={submitReady}
                    >
                        {saveActionMsg}
                    </Button>
                </Form>
            );
        }}
    />
);

EditListingCapacityForm.defaultProps = {
    selectedPlace: null,
    updateError: null,
};

EditListingCapacityForm.propTypes = {
    intl: intlShape.isRequired,
    onSubmit: func.isRequired,
    saveActionMsg: string.isRequired,
    updated: bool.isRequired,
    updateError: propTypes.error,
    updateInProgress: bool.isRequired,
    capacityOptions: arrayOf(
        shape({
            key: string.isRequired,
            label: string.isRequired,
        })
    ).isRequired,
};

export default EditListingCapacityForm;
