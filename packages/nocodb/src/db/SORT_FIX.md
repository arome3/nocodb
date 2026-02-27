# User Sort Builder Parameterization

Refactored the User/CreatedBy/LastModifiedBy sort case to use
Knex nested builder pattern instead of .toQuery() interpolation.
