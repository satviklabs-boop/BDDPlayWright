@ui @login
Feature: User login
  As a registered user
  I want to authenticate on the application
  So that I can access the secure area

  Background:
    Given the login page is open

  @smoke @positive
  Scenario: Successful login with valid credentials
    When I login with valid credentials
    Then I should be redirected to the secure area
    And the success message should be displayed
    And a logout option should be available

  @regression @negative
  Scenario: Login fails with invalid credentials
    When I login with username "wronguser" and password "wrongpassword"
    Then I should remain on the login page
    And an error message should be displayed

  @regression @negative
  Scenario: Login fails with an invalid password for a valid username
    When I login with username "tomsmith" and password "incorrect"
    Then I should remain on the login page
    And an error message should be displayed

  @regression @negative
  Scenario Outline: Login validation with incomplete credentials
    When I login with username "<username>" and password "<password>"
    Then I should remain on the login page

    Examples:
      | username  | password              |
      | tomsmith  |                       |
      |           | SuperSecretPassword!  |
      |           |                       |

  @regression @positive
  Scenario: User can log out after a successful login
    When I login with valid credentials
    Then I should be redirected to the secure area
    When I log out
    Then I should be redirected back to the login page
    And the success message should be displayed

  @regression @edge
  Scenario: Password input masks the entered value
    When I enter the password "SuperSecretPassword!"
    Then the password field should be masked