import { useEffect } from "react";

function upsertMeta(name, content) {
  if (!content) {
    return null;
  }
  const selector = `meta[name="${name}"][data-managed="seo"]`;
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    element.setAttribute("data-managed", "seo");
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
  return element;
}

function upsertLink(rel, href) {
  if (!href) {
    return null;
  }
  const selector = `link[rel="${rel}"][data-managed="seo"]`;
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    element.setAttribute("data-managed", "seo");
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
  return element;
}

function upsertSchema(schema) {
  if (!schema) {
    return null;
  }
  const selector = 'script[type="application/ld+json"][data-managed="seo"]';
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("script");
    element.setAttribute("type", "application/ld+json");
    element.setAttribute("data-managed", "seo");
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(schema, null, 2);
  return element;
}

export function Seo({ title, description, canonical, schema }) {
  useEffect(() => {
    const previousTitle = document.title;
    let descriptionMeta;
    let canonicalLink;
    let schemaScript;

    if (title) {
      document.title = title;
    }

    if (description) {
      descriptionMeta = upsertMeta("description", description);
    }

    if (canonical) {
      canonicalLink = upsertLink("canonical", canonical);
    }

    if (schema) {
      schemaScript = upsertSchema(schema);
    }

    return () => {
      document.title = previousTitle;
      if (descriptionMeta?.parentNode) {
        descriptionMeta.parentNode.removeChild(descriptionMeta);
      }
      if (canonicalLink?.parentNode) {
        canonicalLink.parentNode.removeChild(canonicalLink);
      }
      if (schemaScript?.parentNode) {
        schemaScript.parentNode.removeChild(schemaScript);
      }
    };
  }, [title, description, canonical, schema]);

  return null;
}

export default Seo;
