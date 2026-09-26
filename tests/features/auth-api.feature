@api @login
Feature: Authentication API
  As an API consumer
  I want to authenticate and manage users over HTTP
  So that I can validate the backend independently of the UI

  Background:
    Given the API base URL is configured

  @smoke @positive
  Scenario Outline: Login returns a valid token
    When I send a POST login request with email "<email>" and password "<password>"
    Then the API response status should be 200
    And the API response should contain a token

    Examples:
      | email              | password   |
      | eve.holt@reqres.in | cityslicka |

  @regression @negative
  Scenario Outline: Login without a password is rejected
    When I send a POST login request with email "<email>" but no password
    Then the API response status should be 400
    And the API error message should be "<error>"

    Examples:
      | email              | error            |
      | eve.holt@reqres.in | Missing password |

  @regression @negative
  Scenario Outline: Login with an unregistered email is rejected
    When I send a POST login request with email "<email>" and password "<password>"
    Then the API response status should be 400
    And the API error message should be "<error>"

    Examples:
      | email             | password | error          |
      | unknown@reqres.in | whatever | user not found |

  @smoke @positive
  Scenario Outline: Retrieve an existing user by id
    When I request the user with id <id>
    Then the API response status should be 200
    And the API response should contain user details

    Examples:
      | id |
      | 2  |

  @regression @positive
  Scenario Outline: Create a new user
    When I create a user with name "<name>" and job "<job>"
    Then the API response status should be 201
    And the API response should contain the created user details

    Examples:
      | name              | job         |
      | Satvik Automation | QA Engineer |

  @regression @positive
  Scenario Outline: Update an existing user
    When I update the user with id <id> with name "<name>" and job "<job>"
    Then the API response status should be 200
    And the API response should contain the updated name "<name>"

    Examples:
      | id | name         | job       |
      | 2  | Updated Name | Senior QA |

  @regression @positive
  Scenario Outline: Delete a user
    When I delete the user with id <id>
    Then the API response status should be 204

    Examples:
      | id |
      | 2  |

  @regression @positive
  Scenario Outline: List users with pagination
    When I request page <page> of the users list
    Then the API response status should be 200
    And the API response should contain a paginated list

    Examples:
      | page |
      | 2    |
