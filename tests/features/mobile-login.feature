@mobile @login
Feature: Mobile login

  As a registered user on a mobile device
  I want to authenticate on the application
  So that I can access the secure area

  Background:
    Given the login page is open

  @smoke @positive
  Scenario: Successful login on a mobile viewport
    When I login with username "tomsmith" and password "SuperSecretPassword!"
    Then I should be redirected to the secure area
    And the success message should be displayed
    And a logout option should be available
    And the page should be rendered for a mobile viewport
