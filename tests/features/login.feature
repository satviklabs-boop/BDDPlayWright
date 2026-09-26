@ui @login
Feature: User login
  As a registered user
  I want to authenticate on the application
  So that I can access the secure area

  Background:
    Given the login page is open

  @smoke @positive
  Scenario Outline: Successful login with valid credentials
    When I login with username "<username>" and password "<password>"
    Then I should be redirected to the secure area
    And the success message should be displayed
    And a logout option should be available

    Examples:
      | username | password             |
      | tomsmith | SuperSecretPassword! |

  @regression @negative
  Scenario Outline: Login fails with wrong credentials
    When I login with username "<username>" and password "<password>"
    Then I should remain on the login page
    And an error message should be displayed

    Examples:
      | username  | password      |
      | wronguser | wrongpassword |
      | tomsmith  | incorrect     |

  @regression @negative
  Scenario Outline: Login validation with incomplete credentials
    When I login with username "<username>" and password "<password>"
    Then I should remain on the login page

    Examples:
      | username | password             |
      | tomsmith |                      |
      |          | SuperSecretPassword! |
      |          |                      |

  @regression @positive
  Scenario Outline: User can log out after a successful login
    When I login with username "<username>" and password "<password>"
    Then I should be redirected to the secure area
    When I log out
    Then I should be redirected back to the login page
    And the success message should be displayed

    Examples:
      | username | password             |
      | tomsmith | SuperSecretPassword! |

  @regression @edge
  Scenario Outline: Password input masks the entered value
    When I enter the password "<password>"
    Then the password field should be masked

    Examples:
      | password             |
      | SuperSecretPassword! |
