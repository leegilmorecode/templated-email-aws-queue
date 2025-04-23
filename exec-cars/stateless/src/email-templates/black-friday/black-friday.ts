export const template = `
<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="Helvetica, Arial, sans-serif" />
      <mj-button font-weight="bold" border-radius="6px" />
    </mj-attributes>
    <mj-style>
      .card {
        min-height: 320px;
      }
    </mj-style>
  </mj-head>
  <mj-body background-color="#F5F5F5">
    <mj-section background-color="#6A0DAD" padding="20px">
      <mj-column>
        <mj-text align="center" color="#FFFFFF" font-size="28px" font-weight="bold">
          Gilmore Executive Cars
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" padding="20px">
      <mj-column>
        <mj-text font-size="20px" color="#333333">Hello {{firstName}},</mj-text>
        <mj-text font-size="16px" color="#555555">
          Our <strong>Black Friday Deals</strong> go live this Friday, and you're invited to experience luxury for less.
        </mj-text>
        <mj-button href="https://serverlessadvocate.com" font-size="16px" align="center" background-color="#6A0DAD" color="#FFD700">
          View Deals Now
        </mj-button>
        <mj-button href="https://serverlessadvocate.com" font-size="16px" align="center" background-color="#FFD700" color="#6A0DAD">
          Your Personalised Exclusive Deal
        </mj-button>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" padding-top="0">
      <mj-group>
        <mj-column background-color="#f7f3ff" padding="10px" border="1px solid #e0d6ff" css-class="card">
          <mj-image src="https://www.serverlessadvocate.com/images/cars/car-1.png" alt="BMW 7 Series" />
          <mj-text font-size="16px" align="center" font-weight="bold">BMW 7 Series</mj-text>
          <mj-text font-size="12px" align="center" color="#000">from</mj-text>
          <mj-text font-size="28px" align="center" font-weight="bold" color="#000">£32K</mj-text>
          <mj-button href="https://serverlessadvocate.com" font-size="10px" align="center" background-color="#FFD700" color="#6A0DAD" width="80px">
            View
          </mj-button>
        </mj-column>

        <mj-column background-color="#f7f3ff" padding="10px" border="1px solid #e0d6ff" css-class="card">
          <mj-image src="https://www.serverlessadvocate.com/images/cars/car-2.png" alt="Mercedes Sport" />
          <mj-text font-size="16px" align="center" font-weight="bold">Mercedes Sport</mj-text>
          <mj-text font-size="12px" align="center" color="#000">from</mj-text>
          <mj-text font-size="28px" align="center" font-weight="bold" color="#000">£34K</mj-text>
          <mj-button href="https://serverlessadvocate.com" font-size="10px" align="center" background-color="#FFD700" color="#6A0DAD" width="80px">
            View
          </mj-button>
        </mj-column>

        <mj-column background-color="#f7f3ff" padding="10px" border="1px solid #e0d6ff" css-class="card">
          <mj-image src="https://www.serverlessadvocate.com/images/cars/car-3.png" alt="Range Rover Autobiography" />
          <mj-text font-size="16px" align="center" font-weight="bold">Range Rover </mj-text>
          <mj-text font-size="12px" align="center" color="#000">from</mj-text>
          <mj-text font-size="28px" align="center" font-weight="bold" color="#000">£41K</mj-text>
          <mj-button href="https://serverlessadvocate.com" font-size="10px" align="center" background-color="#FFD700" color="#6A0DAD" width="80px">
            View
          </mj-button>
        </mj-column>
      </mj-group>
    </mj-section>

    <mj-section background-color="#6A0DAD" padding="20px">
      <mj-column>
        <mj-text align="center" color="#FFD700" font-size="14px">
          © 2025 Gilmore Executive Cars. All rights reserved.
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#F5F5F5" padding="10px">
      <mj-column>
        <mj-text align="center" font-size="12px" color="#888888">
          Disclaimer: This is a fictitious company for example code only.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`;
