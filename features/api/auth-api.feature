@api @login
Feature: Authentication API
  As an API consumer
  I want to authenticate and manage users over HTTP
  So that I can validate the backend independently of the UI

  Background:
    Given the API base URL is configured

  @smoke @positive
  Scenario: Login returns a valid token
    When I send a POST login request with valid API credentials
    Then the API response status should be 200
    And the API response should contain a token

  @regression @negative
  Scenario: Login without a password is rejected
    When I send a POST login request with email "eve.holt@reqres.in" but no password
    Then the API response status should be 400
    And the API error message should be "Missing password"

  @regression @negative
  Scenario: Login with an unregistered email is rejected
    When I send a POST login request with email "unknown@reqres.in" and password "whatever"
    Then the API response status should be 400
    And the API error message should be "user not found"

  @smoke @positive
  Scenario: Retrieve an existing user by id
    When I request the user with id 2
    Then the API response status should be 200
    And the API response should contain user details

  @regression @positive
  Scenario: Create a new user
    When I create a user with name "Satvik Automation" and job "QA Engineer"
    Then the API response status should be 201
    And the API response should contain the created user details

  @regression @positive
  Scenario: Update an existing user
    When I update the user with id 2 with name "Updated Name" and job "Senior QA"
    Then the API response status should be 200
    And the API response should contain the updated name "Updated Name"

  @regression @positive
  Scenario: Delete a user
    When I delete the user with id 2
    Then the API response status should be 204

  @regression @positive
  Scenario: List users with pagination
    When I request page 2 of the users list
    Then the API response status should be 200
    And the API response should contain a paginated list