@android @login
Feature: Android app user login
  As a registered mobile user
  I want to authenticate in the Android app
  So that I can access the secure area of the app

  Background:
    Given the app is launched

  @smoke @positive
  Scenario Outline: Successful login with valid credentials
    Given the login screen is open
    When I login with username "<username>" and password "<password>"
    Then I should be redirected to the secure area
    And the success message should be displayed
    And a logout option should be available

    Examples:
      | username | password             |
      | tomsmith | SuperSecretPassword! |

  @regression @negative
  Scenario Outline: Login fails with wrong credentials
    Given the login screen is open
    When I login with username "<username>" and password "<password>"
    Then I should remain on the login screen
    And an error message should be displayed

    Examples:
      | username  | password      |
      | wronguser | wrongpassword |
      | tomsmith  | incorrect     |

  @regression @positive
  Scenario: User can log out after a successful login
    Given the login screen is open
    When I login with username "tomsmith" and password "SuperSecretPassword!"
    Then I should be redirected to the secure area
    When I log out
    Then I should be redirected back to the login screen
