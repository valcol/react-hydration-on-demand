/**
 * @jest-environment node
 */

import React from "react";
import ReactDOMServer from "react-dom/server";
import withHydrationOnDemand from "../../src";

const Component = ({ label }) => <div className="label">{label}</div>;

test("Render correctly server side ", () => {
    const ComponentWithHydrationOnDemand = withHydrationOnDemand({
        on: [["scroll", () => document]]
    })(Component);

    const component = ReactDOMServer.renderToString(
        <ComponentWithHydrationOnDemand label="some content server side" />
    );
    expect(component).toMatchSnapshot();
});

test("Render correctly server side with custom wrapper props", () => {
    const ComponentWithHydrationOnDemand = withHydrationOnDemand()(Component);

    const component = ReactDOMServer.renderToString(
        <ComponentWithHydrationOnDemand
            wrapperProps={{
                className: "test-classname",
                style: { display: "contents" }
            }}
            label="some content server side"
        />
    );
    expect(component).toMatchSnapshot();
});
