/*
Pure Javascript implementation of Uniforum message translation.
Copyright (C) 2008 Joshua I. Miller <unrtst@cpan.org>, all rights reserved

This program is free software; you can redistribute it and/or modify it
under the terms of the GNU Library General Public License as published
by the Free Software Foundation; either version 2, or (at your option)
any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Library General Public License for more details.

You should have received a copy of the GNU Library General Public
License along with this program; if not, write to the Free Software
Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307,
USA.

=head1 NAME

Javascript Gettext - Javascript implemenation of GNU Gettext API.

=head1 SYNOPSIS

 // //////////////////////////////////////////////////////////
 // Optimum caching way
 <script language="javascript" src="/path/LC_MESSAGES/myDomain.json"></script>
 <script language="javascript" src="/path/Gettext.js'></script>

 // assuming myDomain.json defines variable json_locale_data
 var params = {  "domain" : "myDomain",
                 "locale_data" : json_locale_data
              };
 var gt = new Gettext(params);
 // create a shortcut if you'd like
 function _ (msgid) { return gt.gettext(msgid); }
 alert(_("some string"));
 // or use fully named method
 alert(gt.gettext("some string"));
 // change to use a different "domain"
 gt.textdomain("anotherDomain");
 alert(gt.gettext("some string"));


 // //////////////////////////////////////////////////////////
 // The other way to load the language lookup is a "link" tag
 // Downside is that not all browsers cache XMLHttpRequests the
 // same way, so caching of the language data isn't guarenteed
 // across page loads.
 // Upside is that it's easy to specify multiple files
 <link rel="gettext" href="/path/LC_MESSAGES/myDomain.json" />
 <script language="javascript" src="/path/Gettext.js'></script>

 var gt = new Gettext({ "domain" : "myDomain" });
 // rest is the same


 // //////////////////////////////////////////////////////////
 // The reson the shortcuts aren't exported by default is because they'd be
 // glued to the single domain you created. So, if you're adding i18n support
 // to some js library, you should use it as so:

 if (typeof(MyNamespace) == 'undefined') MyNamespace = {};
 MyNamespace.MyClass = function () {
     var gtParms = { "domain" : 'MyNamespace_MyClass' };
     this.gt = new Gettext(gtParams);
     return this;
 };
 MyNamespace.MyClass.prototype._ = function (msgid) {
     return this.gt.gettext(msgid);
 };
 MyNamespace.MyClass.prototype.something = function () {
     var myString = this._("this will get translated");
 };

 // //////////////////////////////////////////////////////////
 // Adding the shortcuts to a global scope is easier. If that's
 // ok in your app, this is certainly easier.
 var myGettext = new Gettext({ 'domain' : 'myDomain' });
 function _ (msgid) {
     return myGettext.gettext(msgid);
 }
 alert( _("text") );

 // //////////////////////////////////////////////////////////
 // Data structure of the json data
 // NOTE: if you're loading via the <script> tag, you can only
 // load one file, but it can contain multiple domains.
 var json_locale_data = {
     "MyDomain" : {
         "" : {
             "header_key" : "header value",
             "header_key" : "header value",
         "msgid" : [ "msgid_plural", "msgstr", "msgstr_plural", "msgstr_pluralN" ],
         "msgctxt\004msgid" : [ null, "msgstr" ],
         },
     "AnotherDomain" : {
         },
     }

=head1 DESCRIPTION

This is a javascript implementation of GNU Gettext, providing internationalization support for javascript. It differs from existing javascript implementations in that it will support all current Gettext features (ex. plural and context support), and will also support loading language catalogs from .mo, .po, or preprocessed json files (converter included).

The locale initialization differs from that of GNU Gettext / POSIX. Rather than setting the category, domain, and paths, and letting the libs find the right file, you must explicitly load the file at some point. The "domain" will still be honored. Future versions may be expanded to include support for set_locale like features.


=head1 INSTALL

To install this module, simply copy the file lib/Gettext.js to a web accessable location, and reference it from your application.


=head1 CONFIGURATION

Configure in one of two ways:

=over

=item 1. Optimal. Load language definition from statically defined json data.

    <script language="javascript" src="/path/locale/domain.json"></script>

    // in domain.json
    json_locale_data = {
        "mydomain" : {
            // po header fields
            "" : {
                "plural-forms" : "...",
                "lang" : "en",
                },
            // all the msgid strings and translations
            "msgid" : [ "msgid_plural", "translation", "plural_translation" ],
        },
    };
    // please see the included bin/po2json script for the details on this format

This method also allows you to use unsupported file formats, so long as you can parse them into the above format.

=item 2. Use AJAX to load language file.

Use XMLHttpRequest (actually, SJAX - syncronous) to load an external resource.

Supported external formats are:

=over

=item * Javascript Object Notation (.json)

(see bin/po2json)

    type=application/json

=item * Uniforum Portable Object (.po)

(see GNU Gettext's xgettext)

    type=application/x-po

=item * Machine Object (compiled .po) (.mo)

NOTE: .mo format isn't actually supported just yet, but support is planned.

(see GNU Gettext's msgfmt)

    type=application/x-mo

=back

=back

=head1 METHODS

The following methods are implemented:

  new Gettext(args)
  textdomain  (domain)
  gettext     (msgid)
  dgettext    (domainname, msgid)
  dcgettext   (domainname, msgid, LC_MESSAGES)
  ngettext    (msgid, msgid_plural, count)
  dngettext   (domainname, msgid, msgid_plural, count)
  dcngettext  (domainname, msgid, msgid_plural, count, LC_MESSAGES)
  pgettext    (msgctxt, msgid)
  dpgettext   (domainname, msgctxt, msgid)
  dcpgettext  (domainname, msgctxt, msgid, LC_MESSAGES)
  npgettext   (msgctxt, msgid, msgid_plural, count)
  dnpgettext  (domainname, msgctxt, msgid, msgid_plural, count)
  dcnpgettext (domainname, msgctxt, msgid, msgid_plural, count, LC_MESSAGES)
  strargs     (string, args_array)


=head2 new Gettext (args)

Several methods of loading locale data are included. You may specify a plugin or alternative method of loading data by passing the data in as the "locale_data" option. For example:

    var get_locale_data = function () {
        // plugin does whatever to populate locale_data
        return locale_data;
    };
    var gt = new Gettext( 'domain' : 'messages',
                          'locale_data' : get_locale_data() );

The above can also be used if locale data is specified in a statically included <SCRIPT> tag. Just specify the variable name in the call to new. Ex:

    var gt = new Gettext( 'domain' : 'messages',
                          'locale_data' : json_locale_data_variable );

Finally, you may load the locale data by referencing it in a <LINK> tag. Simply exclude the 'locale_data' option, and all <LINK rel="gettext" ...> items will be tried. The <LINK> should be specified as:

    <link rel="gettext" type="application/json" href="/path/to/file.json">
    <link rel="gettext" type="text/javascript"  href="/path/to/file.json">
    <link rel="gettext" type="application/x-po" href="/path/to/file.po">
    <link rel="gettext" type="application/x-mo" href="/path/to/file.mo">

args:

=over

=item domain

The Gettext domain, not www.whatev.com. It's usually your applications basename. If the .po file was "myapp.po", this would be "myapp".

=item locale_data

Raw locale data (in json structure). If specified, from_link data will be ignored.

=back

=cut

*/

Gettext = function (args) {
    this.domain         = 'messages';
    // locale_data will be populated from <link...> if not specified in args
    this.locale_data    = undefined;

    // set options
    var options = [ "domain", "locale_data" ];
    if (this.isValidObject(args)) {
        for (var i in args) {
            for (var j=0; j<options.length; j++) {
                if (i == options[j]) {
                    // don't set it if it's null or undefined
                    if (this.isValidObject(args[i]))
                        this[i] = args[i];
                }
            }
        }
    }


    // try to load the lang file from somewhere
    this.try_load_lang();

    return this;
}

Gettext.context_glue = "\004";
Gettext._locale_data = {};

Gettext.prototype.try_load_lang = function() {
    // check to see if language is statically included
    if (typeof(this.locale_data) != 'undefined') {
        // we're going to reformat it, and overwrite the variable
        var locale_copy = this.locale_data;
        this.locale_data = undefined;
        this.parse_locale_data(locale_copy);

        if (typeof(Gettext._locale_data[this.domain]) == 'undefined') {
            throw new Error("Error: Gettext 'locale_data' does not contain the domain '"+this.domain+"'");
        }
    }


    // try loading from JSON
    // get lang links
    var lang_link = this.get_lang_refs();

    if (typeof(lang_link) == 'object' && lang_link.length > 0) {
        // NOTE: there will be a delay here, as this is async.
        // So, any i18n calls made right after page load may not
        // get translated.
        // XXX: we may want to see if we can "fix" this behavior
        for (var i=0; i<lang_link.length; i++) {
            var link = lang_link[i];
            if (link.type == 'application/json') {
                if (! this.try_load_lang_json(link.href) ) {
                    throw new Error("Error: Gettext 'try_load_lang_json' failed. Unable to exec xmlhttprequest for link ["+link.href+"]");
                }
            } else if (link.type == 'application/x-po') {
                if (! this.try_load_lang_po(link.href) ) {
                    throw new Error("Error: Gettext 'try_load_lang_po' failed. Unable to exec xmlhttprequest for link ["+link.href+"]");
                }
            } else {
                // TODO: implement the other types (.mo)
                throw new Error("TODO: link type ["+link.type+"] found, and support is planned, but not implemented at this time.");
            }
        }
    }
};

// This takes the bin/po2json'd data, and moves it into an internal form
// for use in our lib, and puts it in our object as:
//  Gettext._locale_data = {
//      domain : {
//          head : { headfield : headvalue },
//          msgs : {
//              msgid : [ msgid_plural, msgstr, msgstr_plural ],
//          },
Gettext.prototype.parse_locale_data = function(locale_data) {
    if (typeof(Gettext._locale_data) == 'undefined') {
        Gettext._locale_data = { };
    }

    // suck in every domain defined in the supplied data
    for (var domain in locale_data) {
        // skip empty specs (flexibly)
        if ((! locale_data.hasOwnProperty(domain)) || (! this.isValidObject(locale_data[domain])))
            continue;
        // skip if it has no msgid's
        var has_msgids = false;
        for (var msgid in locale_data[domain]) {
            has_msgids = true;
            break;
        }
        if (! has_msgids) continue;

        // grab shortcut to data
        var data = locale_data[domain];

        // if they specifcy a blank domain, default to "messages"
        if (domain == "") domain = "messages";
        // init the data structure
        if (! this.isValidObject(Gettext._locale_data[domain]) )
            Gettext._locale_data[domain] = { };
        if (! this.isValidObject(Gettext._locale_data[domain].head) )
            Gettext._locale_data[domain].head = { };
        if (! this.isValidObject(Gettext._locale_data[domain].msgs) )
            Gettext._locale_data[domain].msgs = { };

        for (var key in data) {
            if (key == "") {
                var header = data[key];
                for (var head in header) {
                    var h = head.toLowerCase();
                    Gettext._locale_data[domain].head[h] = header[head];
                }
            } else {
                Gettext._locale_data[domain].msgs[key] = data[key];
            }
        }
    }

    // build the plural forms function
    for (var domain in Gettext._locale_data) {
        if (this.isValidObject(Gettext._locale_data[domain].head['plural-forms']) &&
            typeof(Gettext._locale_data[domain].head.plural_func) == 'undefined') {
            // untaint data
            var plural_forms = Gettext._locale_data[domain].head['plural-forms'];
            var pf_re = new RegExp('^(\\s*nplurals\\s*=\\s*[0-9]+\\s*;\\s*plural\\s*=\\s*(?:\\s|[-\\?\\|&=!<>+*/%:;a-zA-Z0-9_\(\)])+)', 'm');
            if (pf_re.test(plural_forms)) {
                //ex english: "Plural-Forms: nplurals=2; plural=(n != 1);\n"
                //pf = "nplurals=2; plural=(n != 1);";
                //ex russian: nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10< =4 && (n%100<10 or n%100>=20) ? 1 : 2)
                //pf = "nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2)";

                var pf = Gettext._locale_data[domain].head['plural-forms'];
                if (! /;\s*$/.test(pf)) pf = pf.concat(';');
                /* We used to use eval, but it seems IE has issues with it.
                 * We now use "new Function", though it carries a slightly
                 * bigger performance hit.
                var code = 'function (n) { var plural; var nplurals; '+pf+' return { "nplural" : nplurals, "plural" : (plural === true ? 1 : plural ? plural : 0) }; };';
                Gettext._locale_data[domain].head.plural_func = eval("("+code+")");
                */
                var code = 'var plural; var nplurals; '+pf+' return { "nplural" : nplurals, "plural" : (plural === true ? 1 : plural ? plural : 0) };';
                Gettext._locale_data[domain].head.plural_func = new Function("n", code);
            } else {
                throw new Error("Syntax error in language file. Plural-Forms header is invalid ["+plural_forms+"]");
            }   

        // default to english plural form
        } else if (typeof(Gettext._locale_data[domain].head.plural_func) == 'undefined') {
            Gettext._locale_data[domain].head.plural_func = function (n) {
                var p = (n != 1) ? 1 : 0;
                return { 'nplural' : 2, 'plural' : p };
                };
        } // else, plural_func already created
    }

    return;
};


// try_load_lang_po : do an ajaxy call to load in the .po lang defs
Gettext.prototype.try_load_lang_po = function(uri) {
    var data = this.sjax(uri);
    if (! data) return;

    var domain = this.uri_basename(uri);
    var parsed = this.parse_po(data);

    var rv = {};
    // munge domain into/outof header
    if (parsed) {
        if (! parsed[""]) parsed[""] = {};
        if (! parsed[""]["domain"]) parsed[""]["domain"] = domain;
        domain = parsed[""]["domain"];
        rv[domain] = parsed;

        this.parse_locale_data(rv);
    }

    return 1;
};

Gettext.prototype.uri_basename = function(uri) {
    var rv;
    if (rv = uri.match(/^(.*\/)?(.*)/)) {
        var ext_strip;
        if (ext_strip = rv[2].match(/^(.*)\..+$/))
            return ext_strip[1];
        else
            return rv[2];
    } else {
        return "";
    }
};

Gettext.prototype.parse_po = function(data) {
    var rv = {};
    var buffer = {};
    var lastbuffer = "";
    var errors = [];
    var lines = data.split("\n");
    for (var i=0; i<lines.length; i++) {
        // chomp
        lines[i] = lines[i].replace(/(\n|\r)+$/, '');

        var match;

        // Empty line / End of an entry.
        if (/^$/.test(lines[i])) {
            if (typeof(buffer['msgid']) != 'undefined') {
                var msg_ctxt_id = (typeof(buffer['msgctxt']) != 'undefined' &&
                                   buffer['msgctxt'].length) ?
                                  buffer['msgctxt']+Gettext.context_glue+buffer['msgid'] :
                                  buffer['msgid'];
                var msgid_plural = (typeof(buffer['msgid_plural']) != 'undefined' &&
                                    buffer['msgid_plural'].length) ?
                                   buffer['msgid_plural'] :
                                   null;

                // find msgstr_* translations and push them on
                var trans = [];
                for (var str in buffer) {
                    var match;
                    if (match = str.match(/^msgstr_(\d+)/))
                        trans[parseInt(match[1])] = buffer[str];
                }
                trans.unshift(msgid_plural);

                // only add it if we've got a translation
                // NOTE: this doesn't conform to msgfmt specs
                if (trans.length > 1) rv[msg_ctxt_id] = trans;

                buffer = {};
                lastbuffer = "";
            }

        // comments
        } else if (/^#/.test(lines[i])) {
            continue;

        // msgctxt
        } else if (match = lines[i].match(/^msgctxt\s+(.*)/)) {
            lastbuffer = 'msgctxt';
            buffer[lastbuffer] = this.parse_po_dequote(match[1]);

        // msgid
        } else if (match = lines[i].match(/^msgid\s+(.*)/)) {
            lastbuffer = 'msgid';
            buffer[lastbuffer] = this.parse_po_dequote(match[1]);

        // msgid_plural
        } else if (match = lines[i].match(/^msgid_plural\s+(.*)/)) {
            lastbuffer = 'msgid_plural';
            buffer[lastbuffer] = this.parse_po_dequote(match[1]);

        // msgstr
        } else if (match = lines[i].match(/^msgstr\s+(.*)/)) {
            lastbuffer = 'msgstr_0';
            buffer[lastbuffer] = this.parse_po_dequote(match[1]);

        // msgstr[0] (treak like msgstr)
        } else if (match = lines[i].match(/^msgstr\[0\]\s+(.*)/)) {
            lastbuffer = 'msgstr_0';
            buffer[lastbuffer] = this.parse_po_dequote(match[1]);

        // msgstr[n]
        } else if (match = lines[i].match(/^msgstr\[(\d+)\]\s+(.*)/)) {
            lastbuffer = 'msgstr_'+match[1];
            buffer[lastbuffer] = this.parse_po_dequote(match[2]);

        // continued string
        } else if (/^"/.test(lines[i])) {
            buffer[lastbuffer] += this.parse_po_dequote(lines[i]);

        // something strange
        } else {
            errors.push("Strange line ["+i+"] : "+lines[i]);
        }
    }


    // handle the final entry
    if (typeof(buffer['msgid']) != 'undefined') {
        var msg_ctxt_id = (typeof(buffer['msgctxt']) != 'undefined' &&
                           buffer['msgctxt'].length) ?
                          buffer['msgctxt']+Gettext.context_glue+buffer['msgid'] :
                          buffer['msgid'];
        var msgid_plural = (typeof(buffer['msgid_plural']) != 'undefined' &&
                            buffer['msgid_plural'].length) ?
                           buffer['msgid_plural'] :
                           null;

        // find msgstr_* translations and push them on
        var trans = [];
        for (var str in buffer) {
            var match;
            if (match = str.match(/^msgstr_(\d+)/))
                trans[parseInt(match[1])] = buffer[str];
        }
        trans.unshift(msgid_plural);

        // only add it if we've got a translation
        // NOTE: this doesn't conform to msgfmt specs
        if (trans.length > 1) rv[msg_ctxt_id] = trans;

        buffer = {};
        lastbuffer = "";
    }


    // parse out the header
    if (rv[""] && rv[""][1]) {
        var cur = {};
        var hlines = rv[""][1].split(/\\n/);
        for (var i=0; i<hlines.length; i++) {
            if (! hlines.length) continue;

            var pos = hlines[i].indexOf(':', 0);
            if (pos != -1) {
                var key = hlines[i].substring(0, pos);
                var val = hlines[i].substring(pos +1);
                var keylow = key.toLowerCase();

                if (cur[keylow] && cur[keylow].length) {
                    errors.push("SKIPPING DUPLICATE HEADER LINE: "+hlines[i]);
                } else if (/#-#-#-#-#/.test(keylow)) {
                    errors.push("SKIPPING ERROR MARKER IN HEADER: "+hlines[i]);
                } else {
                    // remove begining spaces if any
                    val = val.replace(/^\s+/, '');
                    cur[keylow] = val;
                }

            } else {
                errors.push("PROBLEM LINE IN HEADER: "+hlines[i]);
                cur[hlines[i]] = '';
            }
        }

        // replace header string with assoc array
        rv[""] = cur;
    } else {
        rv[""] = {};
    }

    // TODO: XXX: if there are errors parsing, what do we want to do?
    // GNU Gettext silently ignores errors. So will we.
    // alert( "Errors parsing po file:\n" + errors.join("\n") );

    return rv;
};


Gettext.prototype.parse_po_dequote = function(str) {
    var match;
    if (match = str.match(/^"(.*)"/)) {
        str = match[1];
    }
    // unescale all embedded quotes (fixes bug #17504)
    str = str.replace(/\\"/g, "\"");
    return str;
};


// try_load_lang_json : do an ajaxy call to load in the lang defs
Gettext.prototype.try_load_lang_json = function(uri) {
    var data = this.sjax(uri);
    if (! data) return;

    var rv = this.JSON(data);
    this.parse_locale_data(rv);

    return 1;
};

// this finds all <link> tags, filters out ones that match our
// specs, and returns a list of hashes of those
Gettext.prototype.get_lang_refs = function() {
    var langs = new Array();
    var links = document.getElementsByTagName("link");
    // find all <link> tags in dom; filter ours
    for (var i=0; i<links.length; i++) {
        if (links[i].rel == 'gettext' && links[i].href) {
            if (typeof(links[i].type) == 'undefined' ||
                links[i].type == '') {
                if (/\.json$/i.test(links[i].href)) {
                    links[i].type = 'application/json';
                } else if (/\.js$/i.test(links[i].href)) {
                    links[i].type = 'application/json';
                } else if (/\.po$/i.test(links[i].href)) {
                    links[i].type = 'application/x-po';
                } else if (/\.mo$/i.test(links[i].href)) {
                    links[i].type = 'application/x-mo';
                } else {
                    throw new Error("LINK tag with rel=gettext found, but the type and extension are unrecognized.");
                }
            }

            links[i].type = links[i].type.toLowerCase();
            if (links[i].type == 'application/json') {
                links[i].type = 'application/json';
            } else if (links[i].type == 'text/javascript') {
                links[i].type = 'application/json';
            } else if (links[i].type == 'application/x-po') {
                links[i].type = 'application/x-po';
            } else if (links[i].type == 'application/x-mo') {
                links[i].type = 'application/x-mo';
            } else {
                throw new Error("LINK tag with rel=gettext found, but the type attribute ["+links[i].type+"] is unrecognized.");
            }

            langs.push(links[i]);
        }
    }
    return langs;
};


/*

=head2 textdomain( domain )

Set domain for future gettext() calls

A  message  domain  is  a  set of translatable msgid messages. Usually,
every software package has its own message domain. The domain  name  is
used to determine the message catalog where a translation is looked up;
it must be a non-empty string.

The current message domain is used by the gettext, ngettext, pgettext,
npgettext functions, and by the dgettext, dcgettext, dngettext, dcngettext,
dpgettext, dcpgettext, dnpgettext and dcnpgettext functions when called
with a NULL domainname argument.

If domainname is not NULL, the current message domain is set to
domainname.

If domainname is undefined, null, or empty string, the function returns
the current message domain.

If  successful,  the  textdomain  function  returns the current message
domain, after possibly changing it. (ie. if you set a new domain, the 
value returned will NOT be the previous domain).

=cut

*/
Gettext.prototype.textdomain = function (domain) {
    if (domain && domain.length) this.domain = domain;
    return this.domain;
}

/*

=head2 gettext( MSGID )

Returns the translation for B<MSGID>.  Example:

    alert( gt.gettext("Hello World!\n") );

If no translation can be found, the unmodified B<MSGID> is returned,
i. e. the function can I<never> fail, and will I<never> mess up your
original message.

One common mistake is to interpolate a variable into the string like this:

  var translated = gt.gettext("Hello " + full_name);

The interpolation will happen before it's passed to gettext, and it's 
unlikely you'll have a translation for every "Hello Tom" and "Hello Dick"
and "Hellow Harry" that may arise.

Use C<strargs()> (see below) to solve this problem:

  var translated = Gettext.strargs( gt.gettext("Hello %1"), [full_name] );

This is espeically useful when multiple replacements are needed, as they 
may not appear in the same order within the translation. As an English to
French example:

  Expected result: "This is the red ball"
  English: "This is the %1 %2"
  French:  "C'est le %2 %1"
  Code: Gettext.strargs( gt.gettext("This is the %1 %2"), ["red", "ball"] );

(The example is stupid because neither color nor thing will get
translated here ...).

=head2 dgettext( TEXTDOMAIN, MSGID )

Like gettext(), but retrieves the message for the specified 
B<TEXTDOMAIN> instead of the default domain.  In case you wonder what
a textdomain is, see above section on the textdomain() call.

=head2 dcgettext( TEXTDOMAIN, MSGID, CATEGORY )

Like dgettext() but retrieves the message from the specified B<CATEGORY>
instead of the default category C<LC_MESSAGES>.

NOTE: the categories are really useless in javascript context. This is
here for GNU Gettext API compatability. In practice, you'll never need
to use this. This applies to all the calls including the B<CATEGORY>.


=head2 ngettext( MSGID, MSGID_PLURAL, COUNT )

Retrieves the correct translation for B<COUNT> items.  In legacy software
you will often find something like:

    alert( count + " file(s) deleted.\n" );

or

    printf(count + " file%s deleted.\n", $count == 1 ? '' : 's');

I<NOTE: javascript lacks a builtin printf, so the above isn't a working example>

The first example looks awkward, the second will only work in English
and languages with similar plural rules.  Before ngettext() was introduced,
the best practice for internationalized programs was:

    if (count == 1) {
        alert( gettext("One file deleted.\n") );
    } else {
        printf( gettext("%d files deleted.\n"), count );
    }

This is a nuisance for the programmer and often still not sufficient
for an adequate translation.  Many languages have completely different
ideas on numerals.  Some (French, Italian, ...) treat 0 and 1 alike,
others make no distinction at all (Japanese, Korean, Chinese, ...),
others have two or more plural forms (Russian, Latvian, Czech,
Polish, ...).  The solution is:

    printf( ngettext("One file deleted.\n",
                     "%d files deleted.\n",
                     count), // argument to ngettext!
            count);          // argument to printf!

In English, or if no translation can be found, the first argument
(B<MSGID>) is picked if C<count> is one, the second one otherwise.
For other languages, the correct plural form (of 1, 2, 3, 4, ...)
is automatically picked, too.  You don't have to know anything about
the plural rules in the target language, ngettext() will take care
of that.

This is most of the time sufficient but you will have to prove your
creativity in cases like

    "%d file(s) deleted, and %d file(s) created.\n"

That said, javascript lacks C<printf()> support. Supplied with Gettext.js
is the C<strargs()> method, which can be used for these cases:

    Gettext.strargs( gt.ngettext( "One file deleted.\n",
                                  "%d files deleted.\n",
                                  count), // argument to ngettext!
                     count); // argument to strargs!

NOTE: the variable replacement isn't done for you, so you must
do it yourself as in the above.

=head2 dngettext( TEXTDOMAIN, MSGID, MSGID_PLURAL, COUNT )

Like ngettext() but retrieves the translation from the specified
textdomain instead of the default domain.

=head2 dcngettext( TEXTDOMAIN, MSGID, MSGID_PLURAL, COUNT, CATEGORY )

Like dngettext() but retrieves the translation from the specified
category, instead of the default category C<LC_MESSAGES>.


=head2 pgettext( MSGCTXT, MSGID )

Returns the translation of MSGID, given the context of MSGCTXT.

Both items are used as a unique key into the message catalog.

This allows the translator to have two entries for words that may
translate to different foreign words based on their context. For
example, the word "View" may be a noun or a verb, which may be
used in a menu as File->View or View->Source.

    alert( pgettext( "Verb: To View", "View" ) );
    alert( pgettext( "Noun: A View", "View"  ) );

The above will both lookup different entries in the message catalog.

In English, or if no translation can be found, the second argument
(B<MSGID>) is returned.

=head2 dpgettext( TEXTDOMAIN, MSGCTXT, MSGID )

Like pgettext(), but retrieves the message for the specified 
B<TEXTDOMAIN> instead of the default domain.

=head2 dcpgettext( TEXTDOMAIN, MSGCTXT, MSGID, CATEGORY )

Like dpgettext() but retrieves the message from the specified B<CATEGORY>
instead of the default category C<LC_MESSAGES>.


=head2 npgettext( MSGCTXT, MSGID, MSGID_PLURAL, COUNT )

Like ngettext() with the addition of context as in pgettext().

In English, or if no translation can be found, the second argument
(MSGID) is picked if B<COUNT> is one, the third one otherwise.

=head2 dnpgettext( TEXTDOMAIN, MSGCTXT, MSGID, MSGID_PLURAL, COUNT )

Like npgettext() but retrieves the translation from the specified
textdomain instead of the default domain.

=head2 dcnpgettext( TEXTDOMAIN, MSGCTXT, MSGID, MSGID_PLURAL, COUNT, CATEGORY )

Like dnpgettext() but retrieves the translation from the specified
category, instead of the default category C<LC_MESSAGES>.

=cut

*/

// gettext
Gettext.prototype.gettext = function (msgid) {
    var msgctxt;
    var msgid_plural;
    var n;
    var category;
    return this.dcnpgettext(null, msgctxt, msgid, msgid_plural, n, category);
};

Gettext.prototype.dgettext = function (domain, msgid) {
    var msgctxt;
    var msgid_plural;
    var n;
    var category;
    return this.dcnpgettext(domain, msgctxt, msgid, msgid_plural, n, category);
};

Gettext.prototype.dcgettext = function (domain, msgid, category) {
    var msgctxt;
    var msgid_plural;
    var n;
    return this.dcnpgettext(domain, msgctxt, msgid, msgid_plural, n, category);
};

// ngettext
Gettext.prototype.ngettext = function (msgid, msgid_plural, n) {
    var msgctxt;
    var category;
    return this.dcnpgettext(null, msgctxt, msgid, msgid_plural, n, category);
};

Gettext.prototype.dngettext = function (domain, msgid, msgid_plural, n) {
    var msgctxt;
    var category;
    return this.dcnpgettext(domain, msgctxt, msgid, msgid_plural, n, category);
};

Gettext.prototype.dcngettext = function (domain, msgid, msgid_plural, n, category) {
    var msgctxt;
    return this.dcnpgettext(domain, msgctxt, msgid, msgid_plural, n, category, category);
};

// pgettext
Gettext.prototype.pgettext = function (msgctxt, msgid) {
    var msgid_plural;
    var n;
    var category;
    return this.dcnpgettext(null, msgctxt, msgid, msgid_plural, n, category);
};

Gettext.prototype.dpgettext = function (domain, msgctxt, msgid) {
    var msgid_plural;
    var n;
    var category;
    return this.dcnpgettext(domain, msgctxt, msgid, msgid_plural, n, category);
};

Gettext.prototype.dcpgettext = function (domain, msgctxt, msgid, category) {
    var msgid_plural;
    var n;
    return this.dcnpgettext(domain, msgctxt, msgid, msgid_plural, n, category);
};

// npgettext
Gettext.prototype.npgettext = function (msgctxt, msgid, msgid_plural, n) {
    var category;
    return this.dcnpgettext(null, msgctxt, msgid, msgid_plural, n, category);
};

Gettext.prototype.dnpgettext = function (domain, msgctxt, msgid, msgid_plural, n) {
    var category;
    return this.dcnpgettext(domain, msgctxt, msgid, msgid_plural, n, category);
};

// this has all the options, so we use it for all of them.
Gettext.prototype.dcnpgettext = function (domain, msgctxt, msgid, msgid_plural, n, category) {
    if (! this.isValidObject(msgid)) return '';

    var plural = this.isValidObject(msgid_plural);
    var msg_ctxt_id = this.isValidObject(msgctxt) ? msgctxt+Gettext.context_glue+msgid : msgid;

    var domainname = this.isValidObject(domain)      ? domain :
                     this.isValidObject(this.domain) ? this.domain :
                                                       'messages';

    // category is always LC_MESSAGES. We ignore all else
    var category_name = 'LC_MESSAGES';
    var category = 5;

    var locale_data = new Array();
    if (typeof(Gettext._locale_data) != 'undefined' &&
        this.isValidObject(Gettext._locale_data[domainname])) {
        locale_data.push( Gettext._locale_data[domainname] );

    } else if (typeof(Gettext._locale_data) != 'undefined') {
        // didn't find domain we're looking for. Search all of them.
        for (var dom in Gettext._locale_data) {
            locale_data.push( Gettext._locale_data[dom] );
        }
    }

    var trans = [];
    var found = false;
    var domain_used; // so we can find plural-forms if needed
    if (locale_data.length) {
        for (var i=0; i<locale_data.length; i++) {
            var locale = locale_data[i];
            if (this.isValidObject(locale.msgs[msg_ctxt_id])) {
                // make copy of that array (cause we'll be destructive)
                for (var j=0; j<locale.msgs[msg_ctxt_id].length; j++) {
                    trans[j] = locale.msgs[msg_ctxt_id][j];
                }
                trans.shift(); // throw away the msgid_plural
                domain_used = locale;
                found = true;
                // only break if found translation actually has a translation.
                if ( trans.length > 0 && trans[0].length != 0 )
                    break;
            }
        }
    }

    // default to english if we lack a match, or match has zero length
    if ( trans.length == 0 || trans[0].length == 0 ) {
        trans = [ msgid, msgid_plural ];
    }

    var translation = trans[0];
    if (plural) {
        var p;
        if (found && this.isValidObject(domain_used.head.plural_func) ) {
            var rv = domain_used.head.plural_func(n);
            if (! rv.plural) rv.plural = 0;
            if (! rv.nplural) rv.nplural = 0;
            // if plurals returned is out of bound for total plural forms
            if (rv.nplural <= rv.plural) rv.plural = 0;
            p = rv.plural;
        } else {
            p = (n != 1) ? 1 : 0;
        }
        if (this.isValidObject(trans[p]))
            translation = trans[p];
    }

    return translation;
};


/*

=head2 strargs (string, argument_array)

  string : a string that potentially contains formatting characters.
  argument_array : an array of positional replacement values

This is a utility method to provide some way to support positional parameters within a string, as javascript lacks a printf() method.

The format is similar to printf(), but greatly simplified (ie. fewer features).

Any percent signs followed by numbers are replaced with the corrosponding item from the B<argument_array>.

Example:

    var string = "%2 roses are red, %1 violets are blue";
    var args   = new Array("10", "15");
    var result = Gettext.strargs(string, args);
    // result is "15 roses are red, 10 violets are blue"

The format numbers are 1 based, so the first itme is %1.

A lone percent sign may be escaped by preceeding it with another percent sign.

A percent sign followed by anything other than a number or another percent sign will be passed through as is.

Some more examples should clear up any abmiguity. The following were called with the orig string, and the array as Array("[one]", "[two]") :

  orig string "blah" becomes "blah"
  orig string "" becomes ""
  orig string "%%" becomes "%"
  orig string "%%%" becomes "%%"
  orig string "%%%%" becomes "%%"
  orig string "%%%%%" becomes "%%%"
  orig string "tom%%dick" becomes "tom%dick"
  orig string "thing%1bob" becomes "thing[one]bob"
  orig string "thing%1%2bob" becomes "thing[one][two]bob"
  orig string "thing%1asdf%2asdf" becomes "thing[one]asdf[two]asdf"
  orig string "%1%2%3" becomes "[one][two]"
  orig string "tom%1%%2%aDick" becomes "tom[one]%2%aDick"

This is especially useful when using plurals, as the string will nearly always contain the number.

It's also useful in translated strings where the translator may have needed to move the position of the parameters.

For example:

  var count = 14;
  Gettext.strargs( gt.ngettext('one banana', '%1 bananas', count), [count] );

NOTE: this may be called as an instance method, or as a class method.

  // instance method:
  var gt = new Gettext(params);
  gt.strargs(string, args);

  // class method:
  Gettext.strargs(string, args);

=cut

*/
/* utility method, since javascript lacks a printf */
Gettext.strargs = function (str, args) {
    // make sure args is an array
    if ( null == args ||
         'undefined' == typeof(args) ) {
        args = [];
    } else if (args.constructor != Array) {
        args = [args];
    }

    // NOTE: javascript lacks support for zero length negative look-behind
    // in regex, so we must step through w/ index.
    // The perl equiv would simply be:
    //    $string =~ s/(?<!\%)\%([0-9]+)/$args[$1]/g;
    //    $string =~ s/\%\%/\%/g; # restore escaped percent signs

    var newstr = "";
    while (true) {
        var i = str.indexOf('%');
        var match_n;

        // no more found. Append whatever remains
        if (i == -1) {
            newstr += str;
            break;
        }

        // we found it, append everything up to that
        newstr += str.substr(0, i);

        // check for escpaed %%
        if (str.substr(i, 2) == '%%') {
            newstr += '%';
            str = str.substr((i+2));

        // % followed by number
        } else if ( match_n = str.substr(i).match(/^%(\d+)/) ) {
            var arg_n = parseInt(match_n[1]);
            var length_n = match_n[1].length;
            if ( arg_n > 0 && args[arg_n -1] != null && typeof(args[arg_n -1]) != 'undefined' )
                newstr += args[arg_n -1];
            str = str.substr( (i + 1 + length_n) );

        // % followed by some other garbage - just remove the %
        } else {
            newstr += '%';
            str = str.substr((i+1));
        }
    }

    return newstr;
}

/* instance method wrapper of strargs */
Gettext.prototype.strargs = function (str, args) {
    return Gettext.strargs(str, args);
}

/* verify that something is an array */
Gettext.prototype.isArray = function (thisObject) {
    return this.isValidObject(thisObject) && thisObject.constructor == Array;
};

/* verify that an object exists and is valid */
Gettext.prototype.isValidObject = function (thisObject) {
    if (null == thisObject) {
        return false;
    } else if ('undefined' == typeof(thisObject) ) {
        return false;
    } else {
        return true;
    }
};

Gettext.prototype.sjax = function (uri) {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else if (navigator.userAgent.toLowerCase().indexOf('msie 5') != -1) {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    } else {
        xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
    }

    if (! xmlhttp)
        throw new Error("Your browser doesn't do Ajax. Unable to support external language files.");

    xmlhttp.open('GET', uri, false);
    try { xmlhttp.send(null); }
    catch (e) { return; }

    // we consider status 200 and 0 as ok.
    // 0 happens when we request local file, allowing this to run on local files
    var sjax_status = xmlhttp.status;
    if (sjax_status == 200 || sjax_status == 0) {
        return xmlhttp.responseText;
    } else {
        var error = xmlhttp.statusText + " (Error " + xmlhttp.status + ")";
        if (xmlhttp.responseText.length) {
            error += "\n" + xmlhttp.responseText;
        }
        alert(error);
        return;
    }
}

Gettext.prototype.JSON = function (data) {
    return eval('(' + data + ')');
}


/*

=head1 NOTES

These are some notes on the internals

=over

=item LOCALE CACHING

Loaded locale data is currently cached class-wide. This means that if two scripts are both using Gettext.js, and both share the same gettext domain, that domain will only be loaded once. This will allow you to grab a new object many times from different places, utilize the same domain, and share a single translation file. The downside is that a domain won't be RE-loaded if a new object is instantiated on a domain that had already been instantiated.

=back

=head1 BUGS / TODO

=over

=item error handling

Currently, there are several places that throw errors. In GNU Gettext, there are no fatal errors, which allows text to still be displayed regardless of how broken the environment becomes. We should evaluate and determine where we want to stand on that issue.

=item syncronous only support (no ajax support)

Currently, fetching language data is done purely syncronous, which means the page will halt while those files are fetched/loaded.

This is often what you want, as then following translation requests will actually be translated. However, if all your calls are done dynamically (ie. error handling only or something), loading in the background may be more adventagous.

It's still recommended to use the statically defined <script ...> method, which should have the same delay, but it will cache the result.

=item domain support

domain support while using shortcut methods like C<_('string')> or C<i18n('string')>.

Under normal apps, the domain is usually set globally to the app, and a single language file is used. Under javascript, you may have multiple libraries or applications needing translation support, but the namespace is essentially global.

It's recommended that your app initialize it's own shortcut with it's own domain.  (See examples/wrapper/i18n.js for an example.)

Basically, you'll want to accomplish something like this:

    // in some other .js file that needs i18n
    this.i18nObj = new i18n;
    this.i18n = this.i18nObj.init('domain');
    // do translation
    alert( this.i18n("string") );

If you use this raw Gettext object, then this is all handled for you, as you have your own object then, and will be calling C<myGettextObject.gettext('string')> and such.


=item encoding

May want to add encoding/reencoding stuff. See GNU iconv, or the perl module Locale::Recode from libintl-perl.

=back


=head1 COMPATABILITY

This has been tested on the following browsers. It may work on others, but these are all those to which I have access.

    FF1.5, FF2, FF3, IE6, IE7, Opera9, Opera10, Safari3.1, Chrome

    *FF = Firefox
    *IE = Internet Explorer


=head1 REQUIRES

bin/po2json requires perl, and the perl modules Locale::PO and JSON.

=head1 SEE ALSO

bin/po2json (included),
examples/normal/index.html,
examples/wrapper/i18n.html, examples/wrapper/i18n.js,
Locale::gettext_pp(3pm), POSIX(3pm), gettext(1), gettext(3)

=head1 AUTHOR

Copyright (C) 2008, Joshua I. Miller E<lt>unrtst@cpan.orgE<gt>, all rights reserved. See the source code for details.

=cut

*/



/*
** Annotator v1.2.9
** https://github.com/okfn/annotator/
**
** Copyright 2013, the Annotator project contributors.
** Dual licensed under the MIT and GPLv3 licenses.
** https://github.com/okfn/annotator/blob/master/LICENSE
**
** Built at: 2013-12-02 17:58:01Z
 */


//

// Generated by CoffeeScript 1.6.3
(function() {
  var $, Annotator, Delegator, LinkParser, Range, Util, base64Decode, base64UrlDecode, createDateFromISO8601, findChild, fn, functions, g, getNodeName, getNodePosition, gettext, parseToken, simpleXPathJQuery, simpleXPathPure, _Annotator, _gettext, _i, _j, _len, _len1, _ref, _ref1, _t,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  simpleXPathJQuery = function(relativeRoot) {
    var jq;
    jq = this.map(function() {
      var elem, idx, path, tagName;
      path = '';
      elem = this;
      while ((elem != null ? elem.nodeType : void 0) === Node.ELEMENT_NODE && elem !== relativeRoot) {
        tagName = elem.tagName.replace(":", "\\:");
        idx = $(elem.parentNode).children(tagName).index(elem) + 1;
        idx = "[" + idx + "]";
        path = "/" + elem.tagName.toLowerCase() + idx + path;
        elem = elem.parentNode;
      }
      return path;
    });
    return jq.get();
  };

  simpleXPathPure = function(relativeRoot) {
    var getPathSegment, getPathTo, jq, rootNode;
    getPathSegment = function(node) {
      var name, pos;
      name = getNodeName(node);
      pos = getNodePosition(node);
      return "" + name + "[" + pos + "]";
    };
    rootNode = relativeRoot;
    getPathTo = function(node) {
      var xpath;
      xpath = '';
      while (node !== rootNode) {
        if (node == null) {
          throw new Error("Called getPathTo on a node which was not a descendant of @rootNode. " + rootNode);
        }
        xpath = (getPathSegment(node)) + '/' + xpath;
        node = node.parentNode;
      }
      xpath = '/' + xpath;
      xpath = xpath.replace(/\/$/, '');
      return xpath;
    };
    jq = this.map(function() {
      var path;
      path = getPathTo(this);
      return path;
    });
    return jq.get();
  };

  findChild = function(node, type, index) {
    var child, children, found, name, _i, _len;
    if (!node.hasChildNodes()) {
      throw new Error("XPath error: node has no children!");
    }
    children = node.childNodes;
    found = 0;
    for (_i = 0, _len = children.length; _i < _len; _i++) {
      child = children[_i];
      name = getNodeName(child);
      if (name === type) {
        found += 1;
        if (found === index) {
          return child;
        }
      }
    }
    throw new Error("XPath error: wanted child not found.");
  };

  getNodeName = function(node) {
    var nodeName;
    nodeName = node.nodeName.toLowerCase();
    switch (nodeName) {
      case "#text":
        return "text()";
      case "#comment":
        return "comment()";
      case "#cdata-section":
        return "cdata-section()";
      default:
        return nodeName;
    }
  };

  getNodePosition = function(node) {
    var pos, tmp;
    pos = 0;
    tmp = node;
    while (tmp) {
      if (tmp.nodeName === node.nodeName) {
        pos++;
      }
      tmp = tmp.previousSibling;
    }
    return pos;
  };

  gettext = null;

  if (typeof Gettext !== "undefined" && Gettext !== null) {
    _gettext = new Gettext({
      domain: "annotator"
    });
    gettext = function(msgid) {
      return _gettext.gettext(msgid);
    };
  } else {
    gettext = function(msgid) {
      return msgid;
    };
  }

  _t = function(msgid) {
    return gettext(msgid);
  };

  if (!(typeof jQuery !== "undefined" && jQuery !== null ? (_ref = jQuery.fn) != null ? _ref.jquery : void 0 : void 0)) {
    console.error(_t("Annotator requires jQuery: have you included lib/vendor/jquery.js?"));
  }

  if (!(JSON && JSON.parse && JSON.stringify)) {
    console.error(_t("Annotator requires a JSON implementation: have you included lib/vendor/json2.js?"));
  }

  $ = jQuery;

  Util = {};

  Util.flatten = function(array) {
    var flatten;
    flatten = function(ary) {
      var el, flat, _i, _len;
      flat = [];
      for (_i = 0, _len = ary.length; _i < _len; _i++) {
        el = ary[_i];
        flat = flat.concat(el && $.isArray(el) ? flatten(el) : el);
      }
      return flat;
    };
    return flatten(array);
  };

  Util.contains = function(parent, child) {
    var node;
    node = child;
    while (node != null) {
      if (node === parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  };

  Util.getTextNodes = function(jq) {
    var getTextNodes;
    getTextNodes = function(node) {
      var nodes;
      if (node && node.nodeType !== Node.TEXT_NODE) {
        nodes = [];
        if (node.nodeType !== Node.COMMENT_NODE) {
          node = node.lastChild;
          while (node) {
            nodes.push(getTextNodes(node));
            node = node.previousSibling;
          }
        }
        return nodes.reverse();
      } else {
        return node;
      }
    };
    return jq.map(function() {
      return Util.flatten(getTextNodes(this));
    });
  };

  Util.getLastTextNodeUpTo = function(n) {
    var result;
    switch (n.nodeType) {
      case Node.TEXT_NODE:
        return n;
      case Node.ELEMENT_NODE:
        if (n.lastChild != null) {
          result = Util.getLastTextNodeUpTo(n.lastChild);
          if (result != null) {
            return result;
          }
        }
        break;
    }
    n = n.previousSibling;
    if (n != null) {
      return Util.getLastTextNodeUpTo(n);
    } else {
      return null;
    }
  };

  Util.getFirstTextNodeNotBefore = function(n) {
    var result;
    switch (n.nodeType) {
      case Node.TEXT_NODE:
        return n;
      case Node.ELEMENT_NODE:
        if (n.firstChild != null) {
          result = Util.getFirstTextNodeNotBefore(n.firstChild);
          if (result != null) {
            return result;
          }
        }
        break;
    }
    n = n.nextSibling;
    if (n != null) {
      return Util.getFirstTextNodeNotBefore(n);
    } else {
      return null;
    }
  };

  Util.readRangeViaSelection = function(range) {
    var sel;
    sel = Util.getGlobal().getSelection();
    sel.removeAllRanges();
    sel.addRange(range.toRange());
    return sel.toString();
  };

  Util.xpathFromNode = function(el, relativeRoot) {
    var exception, result;
    try {
      result = simpleXPathJQuery.call(el, relativeRoot);
    } catch (_error) {
      exception = _error;
      console.log("jQuery-based XPath construction failed! Falling back to manual.");
      result = simpleXPathPure.call(el, relativeRoot);
    }
    return result;
  };

  Util.nodeFromXPath = function(xp, root) {
    var idx, name, node, step, steps, _i, _len, _ref1;
    steps = xp.substring(1).split("/");
    node = root;
    for (_i = 0, _len = steps.length; _i < _len; _i++) {
      step = steps[_i];
      _ref1 = step.split("["), name = _ref1[0], idx = _ref1[1];
      idx = idx != null ? parseInt((idx != null ? idx.split("]") : void 0)[0]) : 1;
      node = findChild(node, name.toLowerCase(), idx);
    }
    return node;
  };

  Util.escape = function(html) {
    return html.replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  Util.uuid = (function() {
    var counter;
    counter = 0;
    return function() {
      return counter++;
    };
  })();

  Util.getGlobal = function() {
    return (function() {
      return this;
    })();
  };

  Util.maxZIndex = function($elements) {
    var all, el;
    all = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = $elements.length; _i < _len; _i++) {
        el = $elements[_i];
        if ($(el).css('position') === 'static') {
          _results.push(-1);
        } else {
          _results.push(parseInt($(el).css('z-index'), 10) || -1);
        }
      }
      return _results;
    })();
    return Math.max.apply(Math, all);
  };

  Util.mousePosition = function(e, offsetEl) {
    var offset, _ref1;
    if ((_ref1 = $(offsetEl).css('position')) !== 'absolute' && _ref1 !== 'fixed' && _ref1 !== 'relative') {
      offsetEl = $(offsetEl).offsetParent()[0];
    }
    offset = $(offsetEl).offset();
    return {
      top: e.pageY - offset.top,
      left: e.pageX - offset.left
    };
  };

  Util.preventEventDefault = function(event) {
    return event != null ? typeof event.preventDefault === "function" ? event.preventDefault() : void 0 : void 0;
  };

  functions = ["log", "debug", "info", "warn", "exception", "assert", "dir", "dirxml", "trace", "group", "groupEnd", "groupCollapsed", "time", "timeEnd", "profile", "profileEnd", "count", "clear", "table", "error", "notifyFirebug", "firebug", "userObjects"];

  if (typeof console !== "undefined" && console !== null) {
    if (console.group == null) {
      console.group = function(name) {
        return console.log("GROUP: ", name);
      };
    }
    if (console.groupCollapsed == null) {
      console.groupCollapsed = console.group;
    }
    for (_i = 0, _len = functions.length; _i < _len; _i++) {
      fn = functions[_i];
      if (console[fn] == null) {
        console[fn] = function() {
          return console.log(_t("Not implemented:") + (" console." + name));
        };
      }
    }
  } else {
    this.console = {};
    for (_j = 0, _len1 = functions.length; _j < _len1; _j++) {
      fn = functions[_j];
      this.console[fn] = function() {};
    }
    this.console['error'] = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return alert("ERROR: " + (args.join(', ')));
    };
    this.console['warn'] = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return alert("WARNING: " + (args.join(', ')));
    };
  }

  Delegator = (function() {
    Delegator.prototype.events = {};

    Delegator.prototype.options = {};

    Delegator.prototype.element = null;

    function Delegator(element, options) {
      this.options = $.extend(true, {}, this.options, options);
      this.element = $(element);
      this._closures = {};
      this.on = this.subscribe;
      this.addEvents();
    }

    Delegator.prototype.addEvents = function() {
      var event, _k, _len2, _ref1, _results;
      _ref1 = Delegator._parseEvents(this.events);
      _results = [];
      for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
        event = _ref1[_k];
        _results.push(this._addEvent(event.selector, event.event, event.functionName));
      }
      return _results;
    };

    Delegator.prototype.removeEvents = function() {
      var event, _k, _len2, _ref1, _results;
      _ref1 = Delegator._parseEvents(this.events);
      _results = [];
      for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
        event = _ref1[_k];
        _results.push(this._removeEvent(event.selector, event.event, event.functionName));
      }
      return _results;
    };

    Delegator.prototype._addEvent = function(selector, event, functionName) {
      var closure;
      closure = (function(_this) {
        return function() {
          return _this[functionName].apply(_this, arguments);
        };
      })(this);
      if (selector === '' && Delegator._isCustomEvent(event)) {
        this.subscribe(event, closure);
      } else {
        this.element.delegate(selector, event, closure);
      }
      this._closures["" + selector + "/" + event + "/" + functionName] = closure;
      return this;
    };

    Delegator.prototype._removeEvent = function(selector, event, functionName) {
      var closure;
      closure = this._closures["" + selector + "/" + event + "/" + functionName];
      if (selector === '' && Delegator._isCustomEvent(event)) {
        this.unsubscribe(event, closure);
      } else {
        this.element.undelegate(selector, event, closure);
      }
      delete this._closures["" + selector + "/" + event + "/" + functionName];
      return this;
    };

    Delegator.prototype.publish = function() {
      this.element.triggerHandler.apply(this.element, arguments);
      return this;
    };

    Delegator.prototype.subscribe = function(event, callback) {
      var closure;
      closure = function() {
        return callback.apply(this, [].slice.call(arguments, 1));
      };
      closure.guid = callback.guid = ($.guid += 1);
      this.element.bind(event, closure);
      return this;
    };

    Delegator.prototype.unsubscribe = function() {
      this.element.unbind.apply(this.element, arguments);
      return this;
    };

    return Delegator;

  })();

  Delegator._parseEvents = function(eventsObj) {
    var event, events, functionName, sel, selector, _k, _ref1;
    events = [];
    for (sel in eventsObj) {
      functionName = eventsObj[sel];
      _ref1 = sel.split(' '), selector = 2 <= _ref1.length ? __slice.call(_ref1, 0, _k = _ref1.length - 1) : (_k = 0, []), event = _ref1[_k++];
      events.push({
        selector: selector.join(' '),
        event: event,
        functionName: functionName
      });
    }
    return events;
  };

  Delegator.natives = (function() {
    var key, specials, val;
    specials = (function() {
      var _ref1, _results;
      _ref1 = jQuery.event.special;
      _results = [];
      for (key in _ref1) {
        if (!__hasProp.call(_ref1, key)) continue;
        val = _ref1[key];
        _results.push(key);
      }
      return _results;
    })();
    return "blur focus focusin focusout load resize scroll unload click dblclick\nmousedown mouseup mousemove mouseover mouseout mouseenter mouseleave\nchange select submit keydown keypress keyup error".split(/[^a-z]+/).concat(specials);
  })();

  Delegator._isCustomEvent = function(event) {
    event = event.split('.')[0];
    return $.inArray(event, Delegator.natives) === -1;
  };

  Range = {};

  Range.sniff = function(r) {
    if (r.commonAncestorContainer != null) {
      return new Range.BrowserRange(r);
    } else if (typeof r.start === "string") {
      return new Range.SerializedRange(r);
    } else if (r.start && typeof r.start === "object") {
      return new Range.NormalizedRange(r);
    } else {
      console.error(_t("Could not sniff range type"));
      return false;
    }
  };

  Range.nodeFromXPath = function(xpath, root) {
    var customResolver, evaluateXPath, namespace, node, segment;
    if (root == null) {
      root = document;
    }
    evaluateXPath = function(xp, nsResolver) {
      var exception;
      if (nsResolver == null) {
        nsResolver = null;
      }
      try {
        return document.evaluate('.' + xp, root, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      } catch (_error) {
        exception = _error;
        console.log("XPath evaluation failed.");
        console.log("Trying fallback...");
        return Util.nodeFromXPath(xp, root);
      }
    };
    if (!$.isXMLDoc(document.documentElement)) {
      return evaluateXPath(xpath);
    } else {
      customResolver = document.createNSResolver(document.ownerDocument === null ? document.documentElement : document.ownerDocument.documentElement);
      node = evaluateXPath(xpath, customResolver);
      if (!node) {
        xpath = ((function() {
          var _k, _len2, _ref1, _results;
          _ref1 = xpath.split('/');
          _results = [];
          for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
            segment = _ref1[_k];
            if (segment && segment.indexOf(':') === -1) {
              _results.push(segment.replace(/^([a-z]+)/, 'xhtml:$1'));
            } else {
              _results.push(segment);
            }
          }
          return _results;
        })()).join('/');
        namespace = document.lookupNamespaceURI(null);
        customResolver = function(ns) {
          if (ns === 'xhtml') {
            return namespace;
          } else {
            return document.documentElement.getAttribute('xmlns:' + ns);
          }
        };
        node = evaluateXPath(xpath, customResolver);
      }
      return node;
    }
  };

  Range.RangeError = (function(_super) {
    __extends(RangeError, _super);

    function RangeError(type, message, parent) {
      this.type = type;
      this.message = message;
      this.parent = parent != null ? parent : null;
      RangeError.__super__.constructor.call(this, this.message);
    }

    return RangeError;

  })(Error);

  Range.BrowserRange = (function() {
    function BrowserRange(obj) {
      this.commonAncestorContainer = obj.commonAncestorContainer;
      this.startContainer = obj.startContainer;
      this.startOffset = obj.startOffset;
      this.endContainer = obj.endContainer;
      this.endOffset = obj.endOffset;
    }

    BrowserRange.prototype.normalize = function(root) {
      var n, node, nr, r;
      if (this.tainted) {
        console.error(_t("You may only call normalize() once on a BrowserRange!"));
        return false;
      } else {
        this.tainted = true;
      }
      r = {};
      if (this.startContainer.nodeType === Node.ELEMENT_NODE) {
        r.start = Util.getFirstTextNodeNotBefore(this.startContainer.childNodes[this.startOffset]);
        r.startOffset = 0;
      } else {
        r.start = this.startContainer;
        r.startOffset = this.startOffset;
      }
      if (this.endContainer.nodeType === Node.ELEMENT_NODE) {
        node = this.endContainer.childNodes[this.endOffset];
        if (node != null) {
          n = node;
          while ((n != null) && (n.nodeType !== Node.TEXT_NODE)) {
            n = n.firstChild;
          }
          if (n != null) {
            r.end = n;
            r.endOffset = 0;
          }
        }
        if (r.end == null) {
          node = this.endContainer.childNodes[this.endOffset - 1];
          r.end = Util.getLastTextNodeUpTo(node);
          r.endOffset = r.end.nodeValue.length;
        }
      } else {
        r.end = this.endContainer;
        r.endOffset = this.endOffset;
      }
      nr = {};
      if (r.startOffset > 0) {
        if (r.start.nodeValue.length > r.startOffset) {
          nr.start = r.start.splitText(r.startOffset);
        } else {
          nr.start = r.start.nextSibling;
        }
      } else {
        nr.start = r.start;
      }
      if (r.start === r.end) {
        if (nr.start.nodeValue.length > (r.endOffset - r.startOffset)) {
          nr.start.splitText(r.endOffset - r.startOffset);
        }
        nr.end = nr.start;
      } else {
        if (r.end.nodeValue.length > r.endOffset) {
          r.end.splitText(r.endOffset);
        }
        nr.end = r.end;
      }
      nr.commonAncestor = this.commonAncestorContainer;
      while (nr.commonAncestor.nodeType !== Node.ELEMENT_NODE) {
        nr.commonAncestor = nr.commonAncestor.parentNode;
      }
      return new Range.NormalizedRange(nr);
    };

    BrowserRange.prototype.serialize = function(root, ignoreSelector) {
      return this.normalize(root).serialize(root, ignoreSelector);
    };

    return BrowserRange;

  })();

  Range.NormalizedRange = (function() {
    function NormalizedRange(obj) {
      this.commonAncestor = obj.commonAncestor;
      this.start = obj.start;
      this.end = obj.end;
    }

    NormalizedRange.prototype.normalize = function(root) {
      return this;
    };

    NormalizedRange.prototype.limit = function(bounds) {
      var nodes, parent, startParents, _k, _len2, _ref1;
      nodes = $.grep(this.textNodes(), function(node) {
        return node.parentNode === bounds || $.contains(bounds, node.parentNode);
      });
      if (!nodes.length) {
        return null;
      }
      this.start = nodes[0];
      this.end = nodes[nodes.length - 1];
      startParents = $(this.start).parents();
      _ref1 = $(this.end).parents();
      for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
        parent = _ref1[_k];
        if (startParents.index(parent) !== -1) {
          this.commonAncestor = parent;
          break;
        }
      }
      return this;
    };

    NormalizedRange.prototype.serialize = function(root, ignoreSelector) {
      var end, serialization, start;
      serialization = function(node, isEnd) {
        var n, nodes, offset, origParent, textNodes, xpath, _k, _len2;
        if (ignoreSelector) {
          origParent = $(node).parents(":not(" + ignoreSelector + ")").eq(0);
        } else {
          origParent = $(node).parent();
        }
        xpath = Util.xpathFromNode(origParent, root)[0];
        textNodes = Util.getTextNodes(origParent);
        nodes = textNodes.slice(0, textNodes.index(node));
        offset = 0;
        for (_k = 0, _len2 = nodes.length; _k < _len2; _k++) {
          n = nodes[_k];
          offset += n.nodeValue.length;
        }
        if (isEnd) {
          return [xpath, offset + node.nodeValue.length];
        } else {
          return [xpath, offset];
        }
      };
      start = serialization(this.start);
      end = serialization(this.end, true);
      return new Range.SerializedRange({
        start: start[0],
        end: end[0],
        startOffset: start[1],
        endOffset: end[1]
      });
    };

    NormalizedRange.prototype.text = function() {
      var node;
      return ((function() {
        var _k, _len2, _ref1, _results;
        _ref1 = this.textNodes();
        _results = [];
        for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
          node = _ref1[_k];
          _results.push(node.nodeValue);
        }
        return _results;
      }).call(this)).join('');
    };

    NormalizedRange.prototype.textNodes = function() {
      var end, start, textNodes, _ref1;
      textNodes = Util.getTextNodes($(this.commonAncestor));
      _ref1 = [textNodes.index(this.start), textNodes.index(this.end)], start = _ref1[0], end = _ref1[1];
      return $.makeArray(textNodes.slice(start, +end + 1 || 9e9));
    };

    NormalizedRange.prototype.toRange = function() {
      var range;
      range = document.createRange();
      range.setStartBefore(this.start);
      range.setEndAfter(this.end);
      return range;
    };

    return NormalizedRange;

  })();

  Range.SerializedRange = (function() {
    function SerializedRange(obj) {
      this.start = obj.start;
      this.startOffset = obj.startOffset;
      this.end = obj.end;
      this.endOffset = obj.endOffset;
    }

    SerializedRange.prototype.normalize = function(root) {
      var contains, e, length, node, p, range, targetOffset, tn, _k, _l, _len2, _len3, _ref1, _ref2;
      range = {};
      _ref1 = ['start', 'end'];
      for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
        p = _ref1[_k];
        try {
          node = Range.nodeFromXPath(this[p], root);
        } catch (_error) {
          e = _error;
          throw new Range.RangeError(p, ("Error while finding " + p + " node: " + this[p] + ": ") + e, e);
        }
        if (!node) {
          throw new Range.RangeError(p, "Couldn't find " + p + " node: " + this[p]);
        }
        length = 0;
        targetOffset = this[p + 'Offset'];
        if (p === 'end') {
          targetOffset--;
        }
        _ref2 = Util.getTextNodes($(node));
        for (_l = 0, _len3 = _ref2.length; _l < _len3; _l++) {
          tn = _ref2[_l];
          if (length + tn.nodeValue.length > targetOffset) {
            range[p + 'Container'] = tn;
            range[p + 'Offset'] = this[p + 'Offset'] - length;
            break;
          } else {
            length += tn.nodeValue.length;
          }
        }
        if (range[p + 'Offset'] == null) {
          throw new Range.RangeError("" + p + "offset", "Couldn't find offset " + this[p + 'Offset'] + " in element " + this[p]);
        }
      }
      contains = document.compareDocumentPosition == null ? function(a, b) {
        return a.contains(b);
      } : function(a, b) {
        return a.compareDocumentPosition(b) & 16;
      };
      $(range.startContainer).parents().each(function() {
        if (contains(this, range.endContainer)) {
          range.commonAncestorContainer = this;
          return false;
        }
      });
      return new Range.BrowserRange(range).normalize(root);
    };

    SerializedRange.prototype.serialize = function(root, ignoreSelector) {
      return this.normalize(root).serialize(root, ignoreSelector);
    };

    SerializedRange.prototype.toObject = function() {
      return {
        start: this.start,
        startOffset: this.startOffset,
        end: this.end,
        endOffset: this.endOffset
      };
    };

    return SerializedRange;

  })();

  _Annotator = this.Annotator;

  Annotator = (function(_super) {
    __extends(Annotator, _super);

    Annotator.prototype.events = {
      ".annotator-adder button click": "onAdderClick",
      ".annotator-adder button mousedown": "onAdderMousedown",
      ".annotator-hl mouseover": "onHighlightMouseover",
      ".annotator-hl mouseout": "startViewerHideTimer"
    };

    Annotator.prototype.html = {
      adder: '<div class="annotator-adder"><button>' + _t('Annotate') + '</button></div>',
      wrapper: '<div class="annotator-wrapper"></div>'
    };

    Annotator.prototype.options = {
      readOnly: false
    };

    Annotator.prototype.plugins = {};

    Annotator.prototype.editor = null;

    Annotator.prototype.viewer = null;

    Annotator.prototype.selectedRanges = null;

    Annotator.prototype.mouseIsDown = false;

    Annotator.prototype.ignoreMouseup = false;

    Annotator.prototype.viewerHideTimer = null;

    function Annotator(element, options) {
      this.onDeleteAnnotation = __bind(this.onDeleteAnnotation, this);
      this.onEditAnnotation = __bind(this.onEditAnnotation, this);
      this.onAdderClick = __bind(this.onAdderClick, this);
      this.onAdderMousedown = __bind(this.onAdderMousedown, this);
      this.onHighlightMouseover = __bind(this.onHighlightMouseover, this);
      this.checkForEndSelection = __bind(this.checkForEndSelection, this);
      this.checkForStartSelection = __bind(this.checkForStartSelection, this);
      this.clearViewerHideTimer = __bind(this.clearViewerHideTimer, this);
      this.startViewerHideTimer = __bind(this.startViewerHideTimer, this);
      this.showViewer = __bind(this.showViewer, this);
      this.onEditorSubmit = __bind(this.onEditorSubmit, this);
      this.onEditorHide = __bind(this.onEditorHide, this);
      this.showEditor = __bind(this.showEditor, this);
      Annotator.__super__.constructor.apply(this, arguments);
      this.plugins = {};
      if (!Annotator.supported()) {
        return this;
      }
      if (!this.options.readOnly) {
        this._setupDocumentEvents();
      }
      this._setupWrapper()._setupViewer()._setupEditor();
      this._setupDynamicStyle();
      this.adder = $(this.html.adder).appendTo(this.wrapper).hide();
      Annotator._instances.push(this);
    }

    Annotator.prototype._setupWrapper = function() {
      this.wrapper = $(this.html.wrapper);
      this.element.find('script').remove();
      this.element.wrapInner(this.wrapper);
      this.wrapper = this.element.find('.annotator-wrapper');
      return this;
    };

    Annotator.prototype._setupViewer = function() {
      this.viewer = new Annotator.Viewer({
        readOnly: this.options.readOnly
      });
      this.viewer.hide().on("edit", this.onEditAnnotation).on("delete", this.onDeleteAnnotation).addField({
        load: (function(_this) {
          return function(field, annotation) {
            if (annotation.text) {
              $(field).html(Util.escape(annotation.text));
            } else {
              $(field).html("<i>" + (_t('No Comment')) + "</i>");
            }
            return _this.publish('annotationViewerTextField', [field, annotation]);
          };
        })(this)
      }).element.appendTo(this.wrapper).bind({
        "mouseover": this.clearViewerHideTimer,
        "mouseout": this.startViewerHideTimer
      });
      return this;
    };

    Annotator.prototype._setupEditor = function() {
      this.editor = new Annotator.Editor();
      this.editor.hide().on('hide', this.onEditorHide).on('save', this.onEditorSubmit).addField({
        type: 'textarea',
        label: _t('Comments') + '\u2026',
        load: function(field, annotation) {
          return $(field).find('textarea').val(annotation.text || '');
        },
        submit: function(field, annotation) {
          return annotation.text = $(field).find('textarea').val();
        }
      });
      this.editor.element.appendTo(this.wrapper);
      return this;
    };

    Annotator.prototype._setupDocumentEvents = function() {
      $(document).bind({
        "mouseup": this.checkForEndSelection,
        "mousedown": this.checkForStartSelection
      });
      return this;
    };

    Annotator.prototype._setupDynamicStyle = function() {
      var max, sel, style, x;
      style = $('#annotator-dynamic-style');
      if (!style.length) {
        style = $('<style id="annotator-dynamic-style"></style>').appendTo(document.head);
      }
      sel = '*' + ((function() {
        var _k, _len2, _ref1, _results;
        _ref1 = ['adder', 'outer', 'notice', 'filter'];
        _results = [];
        for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
          x = _ref1[_k];
          _results.push(":not(.annotator-" + x + ")");
        }
        return _results;
      })()).join('');
      max = Util.maxZIndex($(document.body).find(sel));
      max = Math.max(max, 1000);
      style.text([".annotator-adder, .annotator-outer, .annotator-notice {", "  z-index: " + (max + 20) + ";", "}", ".annotator-filter {", "  z-index: " + (max + 10) + ";", "}"].join("\n"));
      return this;
    };

    Annotator.prototype.destroy = function() {
      var idx, name, plugin, _ref1;
      $(document).unbind({
        "mouseup": this.checkForEndSelection,
        "mousedown": this.checkForStartSelection
      });
      $('#annotator-dynamic-style').remove();
      this.adder.remove();
      this.viewer.destroy();
      this.editor.destroy();
      this.wrapper.find('.annotator-hl').each(function() {
        $(this).contents().insertBefore(this);
        return $(this).remove();
      });
      this.wrapper.contents().insertBefore(this.wrapper);
      this.wrapper.remove();
      this.element.data('annotator', null);
      _ref1 = this.plugins;
      for (name in _ref1) {
        plugin = _ref1[name];
        this.plugins[name].destroy();
      }
      this.removeEvents();
      idx = Annotator._instances.indexOf(this);
      if (idx !== -1) {
        return Annotator._instances.splice(idx, 1);
      }
    };

    Annotator.prototype.getSelectedRanges = function() {
      var browserRange, i, normedRange, r, ranges, rangesToIgnore, selection, _k, _len2;
      selection = Util.getGlobal().getSelection();
      ranges = [];
      rangesToIgnore = [];
      if (!selection.isCollapsed) {
        ranges = (function() {
          var _k, _ref1, _results;
          _results = [];
          for (i = _k = 0, _ref1 = selection.rangeCount; 0 <= _ref1 ? _k < _ref1 : _k > _ref1; i = 0 <= _ref1 ? ++_k : --_k) {
            r = selection.getRangeAt(i);
            browserRange = new Range.BrowserRange(r);
            normedRange = browserRange.normalize().limit(this.wrapper[0]);
            if (normedRange === null) {
              rangesToIgnore.push(r);
            }
            _results.push(normedRange);
          }
          return _results;
        }).call(this);
        selection.removeAllRanges();
      }
      for (_k = 0, _len2 = rangesToIgnore.length; _k < _len2; _k++) {
        r = rangesToIgnore[_k];
        selection.addRange(r);
      }
      return $.grep(ranges, function(range) {
        if (range) {
          selection.addRange(range.toRange());
        }
        return range;
      });
    };

    Annotator.prototype.createAnnotation = function() {
      var annotation;
      annotation = {};
      this.publish('beforeAnnotationCreated', [annotation]);
      return annotation;
    };

    Annotator.prototype.setupAnnotation = function(annotation) {
      var e, normed, normedRanges, r, root, _k, _l, _len2, _len3, _ref1;
      root = this.wrapper[0];
      annotation.ranges || (annotation.ranges = this.selectedRanges);
      normedRanges = [];
      _ref1 = annotation.ranges;
      if( _ref1 != null ) {
          for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
              r = _ref1[_k];
              try {
                  normedRanges.push(Range.sniff(r).normalize(root));
              } catch (_error) {
                  e = _error;
                  if (e instanceof Range.RangeError) {
                      this.publish('rangeNormalizeFail', [annotation, r, e]);
                  } else {
                      throw e;
                  }
              }
          }
      }
      annotation.quote = [];
      annotation.ranges = [];
      annotation.highlights = [];
      for (_l = 0, _len3 = normedRanges.length; _l < _len3; _l++) {
        normed = normedRanges[_l];
        annotation.quote.push($.trim(normed.text()));
        annotation.ranges.push(normed.serialize(this.wrapper[0], '.annotator-hl'));
        $.merge(annotation.highlights, this.highlightRange(normed));
      }
      annotation.quote = annotation.quote.join(' / ');
      $(annotation.highlights).data('annotation', annotation);
      return annotation;
    };

    Annotator.prototype.updateAnnotation = function(annotation) {
      this.publish('beforeAnnotationUpdated', [annotation]);
      this.publish('annotationUpdated', [annotation]);
      return annotation;
    };

    Annotator.prototype.deleteAnnotation = function(annotation) {
      var child, h, _k, _len2, _ref1;
      if (annotation.highlights != null) {
        _ref1 = annotation.highlights;
        for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
          h = _ref1[_k];
          if (!(h.parentNode != null)) {
            continue;
          }
          child = h.childNodes[0];
          $(h).replaceWith(h.childNodes);
        }
      }
      this.publish('annotationDeleted', [annotation]);
      return annotation;
    };

    Annotator.prototype.loadAnnotations = function(annotations) {
      var clone, loader;
      if (annotations == null) {
        annotations = [];
      }
      loader = (function(_this) {
        return function(annList) {
          var n, now, _k, _len2;
          if (annList == null) {
            annList = [];
          }
          now = annList.splice(0, 10);
          for (_k = 0, _len2 = now.length; _k < _len2; _k++) {
            n = now[_k];
            _this.setupAnnotation(n);
          }
          if (annList.length > 0) {
            return setTimeout((function() {
              return loader(annList);
            }), 10);
          } else {
            return _this.publish('annotationsLoaded', [clone]);
          }
        };
      })(this);
      clone = annotations.slice();
      loader(annotations);
      return this;
    };

    Annotator.prototype.dumpAnnotations = function() {
      if (this.plugins['Store']) {
        return this.plugins['Store'].dumpAnnotations();
      } else {
        console.warn(_t("Can't dump annotations without Store plugin."));
        return false;
      }
    };

    Annotator.prototype.highlightRange = function(normedRange, cssClass) {
      var hl, node, white, _k, _len2, _ref1, _results;
      if (cssClass == null) {
        cssClass = 'annotator-hl';
      }
      white = /^\s*$/;
      hl = $("<span class='" + cssClass + "'></span>");
      _ref1 = normedRange.textNodes();
      _results = [];
      for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
        node = _ref1[_k];
        if (!white.test(node.nodeValue)) {
          _results.push($(node).wrapAll(hl).parent().show()[0]);
        }
      }
      return _results;
    };

    Annotator.prototype.highlightRanges = function(normedRanges, cssClass) {
      var highlights, r, _k, _len2;
      if (cssClass == null) {
        cssClass = 'annotator-hl';
      }
      highlights = [];
      for (_k = 0, _len2 = normedRanges.length; _k < _len2; _k++) {
        r = normedRanges[_k];
        $.merge(highlights, this.highlightRange(r, cssClass));
      }
      return highlights;
    };

    Annotator.prototype.addPlugin = function(name, options) {
      var klass, _base;
      if (this.plugins[name]) {
        console.error(_t("You cannot have more than one instance of any plugin."));
      } else {
        klass = Annotator.Plugin[name];
        if (typeof klass === 'function') {
          this.plugins[name] = new klass(this.element[0], options);
          this.plugins[name].annotator = this;
          if (typeof (_base = this.plugins[name]).pluginInit === "function") {
            _base.pluginInit();
          }
        } else {
          console.error(_t("Could not load ") + name + _t(" plugin. Have you included the appropriate <script> tag?"));
        }
      }
      return this;
    };

    Annotator.prototype.showEditor = function(annotation, location) {
      this.editor.element.css(location);
      this.editor.load(annotation);
      this.publish('annotationEditorShown', [this.editor, annotation]);
      return this;
    };

    Annotator.prototype.onEditorHide = function() {
      this.publish('annotationEditorHidden', [this.editor]);
      return this.ignoreMouseup = false;
    };

    Annotator.prototype.onEditorSubmit = function(annotation) {
      return this.publish('annotationEditorSubmit', [this.editor, annotation]);
    };

    Annotator.prototype.showViewer = function(annotations, location) {
      this.viewer.element.css(location);
      this.viewer.load(annotations);
      return this.publish('annotationViewerShown', [this.viewer, annotations]);
    };

    Annotator.prototype.startViewerHideTimer = function() {
      if (!this.viewerHideTimer) {
        return this.viewerHideTimer = setTimeout(this.viewer.hide, 250);
      }
    };

    Annotator.prototype.clearViewerHideTimer = function() {
      clearTimeout(this.viewerHideTimer);
      return this.viewerHideTimer = false;
    };

    Annotator.prototype.checkForStartSelection = function(event) {
      if (!(event && this.isAnnotator(event.target))) {
        this.startViewerHideTimer();
      }
      return this.mouseIsDown = true;
    };

    Annotator.prototype.checkForEndSelection = function(event) {
      var container, range, _k, _len2, _ref1;
      this.mouseIsDown = false;
      if (this.ignoreMouseup) {
        return;
      }
      this.selectedRanges = this.getSelectedRanges();
      _ref1 = this.selectedRanges;
      for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
        range = _ref1[_k];
        container = range.commonAncestor;
        if ($(container).hasClass('annotator-hl')) {
          container = $(container).parents('[class!=annotator-hl]')[0];
        }
        if (this.isAnnotator(container)) {
          return;
        }
      }
      if (event && this.selectedRanges.length) {
        return this.adder.css(Util.mousePosition(event, this.wrapper[0])).show();
      } else {
        return this.adder.hide();
      }
    };

    Annotator.prototype.isAnnotator = function(element) {
      return !!$(element).parents().addBack().filter('[class^=annotator-]').not(this.wrapper).length;
    };

    Annotator.prototype.onHighlightMouseover = function(event) {
      var annotations;
      this.clearViewerHideTimer();
      if (this.mouseIsDown || this.viewer.isShown()) {
        return false;
      }
      annotations = $(event.target).parents('.annotator-hl').addBack().map(function() {
        return $(this).data("annotation");
      });
      return this.showViewer($.makeArray(annotations), Util.mousePosition(event, this.wrapper[0]));
    };

    Annotator.prototype.onAdderMousedown = function(event) {
      if (event != null) {
        event.preventDefault();
      }
      return this.ignoreMouseup = true;
    };

    Annotator.prototype.onAdderClick = function(event) {
      var annotation, cancel, cleanup, position, save;
      if (event != null) {
        event.preventDefault();
      }
      position = this.adder.position();
      this.adder.hide();
      annotation = this.setupAnnotation(this.createAnnotation());
      $(annotation.highlights).addClass('annotator-hl-temporary');
      save = (function(_this) {
        return function() {
          cleanup();
          $(annotation.highlights).removeClass('annotator-hl-temporary');
          return _this.publish('annotationCreated', [annotation]);
        };
      })(this);
      cancel = (function(_this) {
        return function() {
          cleanup();
          return _this.deleteAnnotation(annotation);
        };
      })(this);
      cleanup = (function(_this) {
        return function() {
          _this.unsubscribe('annotationEditorHidden', cancel);
          return _this.unsubscribe('annotationEditorSubmit', save);
        };
      })(this);
      this.subscribe('annotationEditorHidden', cancel);
      this.subscribe('annotationEditorSubmit', save);
      return this.showEditor(annotation, position);
    };

    Annotator.prototype.onEditAnnotation = function(annotation) {
      var cleanup, offset, update;
      offset = this.viewer.element.position();
      update = (function(_this) {
        return function() {
          cleanup();
          return _this.updateAnnotation(annotation);
        };
      })(this);
      cleanup = (function(_this) {
        return function() {
          _this.unsubscribe('annotationEditorHidden', cleanup);
          return _this.unsubscribe('annotationEditorSubmit', update);
        };
      })(this);
      this.subscribe('annotationEditorHidden', cleanup);
      this.subscribe('annotationEditorSubmit', update);
      this.viewer.hide();
      return this.showEditor(annotation, offset);
    };

    Annotator.prototype.onDeleteAnnotation = function(annotation) {
      this.viewer.hide();
      return this.deleteAnnotation(annotation);
    };

    return Annotator;

  })(Delegator);

  Annotator.Plugin = (function(_super) {
    __extends(Plugin, _super);

    function Plugin(element, options) {
      Plugin.__super__.constructor.apply(this, arguments);
    }

    Plugin.prototype.pluginInit = function() {};

    Plugin.prototype.destroy = function() {
      return this.removeEvents();
    };

    return Plugin;

  })(Delegator);

  g = Util.getGlobal();

  if (((_ref1 = g.document) != null ? _ref1.evaluate : void 0) == null) {
    $.getScript('http://assets.annotateit.org/vendor/xpath.min.js');
  }

  if (g.getSelection == null) {
    $.getScript('http://assets.annotateit.org/vendor/ierange.min.js');
  }

  if (g.JSON == null) {
    $.getScript('http://assets.annotateit.org/vendor/json2.min.js');
  }

  if (g.Node == null) {
    g.Node = {
      ELEMENT_NODE: 1,
      ATTRIBUTE_NODE: 2,
      TEXT_NODE: 3,
      CDATA_SECTION_NODE: 4,
      ENTITY_REFERENCE_NODE: 5,
      ENTITY_NODE: 6,
      PROCESSING_INSTRUCTION_NODE: 7,
      COMMENT_NODE: 8,
      DOCUMENT_NODE: 9,
      DOCUMENT_TYPE_NODE: 10,
      DOCUMENT_FRAGMENT_NODE: 11,
      NOTATION_NODE: 12
    };
  }

  Annotator.$ = $;

  Annotator.Delegator = Delegator;

  Annotator.Range = Range;

  Annotator.Util = Util;

  Annotator._instances = [];

  Annotator._t = _t;

  Annotator.supported = function() {
    return (function() {
      return !!this.getSelection;
    })();
  };

  Annotator.noConflict = function() {
    Util.getGlobal().Annotator = _Annotator;
    return this;
  };

  $.fn.annotator = function(options) {
    var args;
    args = Array.prototype.slice.call(arguments, 1);
    return this.each(function() {
      var instance;
      instance = $.data(this, 'annotator');
      if (instance) {
        return options && instance[options].apply(instance, args);
      } else {
        instance = new Annotator(this, options);
        return $.data(this, 'annotator', instance);
      }
    });
  };

  this.Annotator = Annotator;

  Annotator.Widget = (function(_super) {
    __extends(Widget, _super);

    Widget.prototype.classes = {
      hide: 'annotator-hide',
      invert: {
        x: 'annotator-invert-x',
        y: 'annotator-invert-y'
      }
    };

    function Widget(element, options) {
      Widget.__super__.constructor.apply(this, arguments);
      this.classes = $.extend({}, Annotator.Widget.prototype.classes, this.classes);
    }

    Widget.prototype.destroy = function() {
      this.removeEvents();
      return this.element.remove();
    };

    Widget.prototype.checkOrientation = function() {
      var current, offset, viewport, widget, window;
      this.resetOrientation();
      window = $(Annotator.Util.getGlobal());
      widget = this.element.children(":first");
      offset = widget.offset();
      viewport = {
        top: window.scrollTop(),
        right: window.width() + window.scrollLeft()
      };
      current = {
        top: offset.top,
        right: offset.left + widget.width()
      };
      if ((current.top - viewport.top) < 0) {
        this.invertY();
      }
      if ((current.right - viewport.right) > 0) {
        this.invertX();
      }
      return this;
    };

    Widget.prototype.resetOrientation = function() {
      this.element.removeClass(this.classes.invert.x).removeClass(this.classes.invert.y);
      return this;
    };

    Widget.prototype.invertX = function() {
      this.element.addClass(this.classes.invert.x);
      return this;
    };

    Widget.prototype.invertY = function() {
      this.element.addClass(this.classes.invert.y);
      return this;
    };

    Widget.prototype.isInvertedY = function() {
      return this.element.hasClass(this.classes.invert.y);
    };

    Widget.prototype.isInvertedX = function() {
      return this.element.hasClass(this.classes.invert.x);
    };

    return Widget;

  })(Delegator);

  Annotator.Editor = (function(_super) {
    __extends(Editor, _super);

    Editor.prototype.events = {
      "form submit": "submit",
      ".annotator-save click": "submit",
      ".annotator-cancel click": "hide",
      ".annotator-cancel mouseover": "onCancelButtonMouseover",
      "textarea keydown": "processKeypress"
    };

    Editor.prototype.classes = {
      hide: 'annotator-hide',
      focus: 'annotator-focus'
    };

    Editor.prototype.html = "<div class=\"annotator-outer annotator-editor\">\n  <form class=\"annotator-widget\">\n    <ul class=\"annotator-listing\"></ul>\n    <div class=\"annotator-controls\">\n      <a href=\"#cancel\" class=\"annotator-cancel\">" + _t('Cancel') + "</a>\n<a href=\"#save\" class=\"annotator-save annotator-focus\">" + _t('Save') + "</a>\n    </div>\n  </form>\n</div>";

    Editor.prototype.options = {};

    function Editor(options) {
      this.onCancelButtonMouseover = __bind(this.onCancelButtonMouseover, this);
      this.processKeypress = __bind(this.processKeypress, this);
      this.submit = __bind(this.submit, this);
      this.load = __bind(this.load, this);
      this.hide = __bind(this.hide, this);
      this.show = __bind(this.show, this);
      Editor.__super__.constructor.call(this, $(this.html)[0], options);
      this.fields = [];
      this.annotation = {};
    }

    Editor.prototype.show = function(event) {
      Annotator.Util.preventEventDefault(event);
      this.element.removeClass(this.classes.hide);
      this.element.find('.annotator-save').addClass(this.classes.focus);
      this.checkOrientation();
      this.element.find(":input:first").focus();
      this.setupDraggables();
      return this.publish('show');
    };

    Editor.prototype.hide = function(event) {
      Annotator.Util.preventEventDefault(event);
      this.element.addClass(this.classes.hide);
      return this.publish('hide');
    };

    Editor.prototype.load = function(annotation) {
      var field, _k, _len2, _ref2;
      this.annotation = annotation;
      this.publish('load', [this.annotation]);
      _ref2 = this.fields;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        field = _ref2[_k];
        field.load(field.element, this.annotation);
      }
      return this.show();
    };

    Editor.prototype.submit = function(event) {
      var field, _k, _len2, _ref2;
      Annotator.Util.preventEventDefault(event);
      _ref2 = this.fields;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        field = _ref2[_k];
        field.submit(field.element, this.annotation);
      }
      this.publish('save', [this.annotation]);
      return this.hide();
    };

    Editor.prototype.addField = function(options) {
      var element, field, input;
      field = $.extend({
        id: 'annotator-field-' + Annotator.Util.uuid(),
        type: 'input',
        label: '',
        load: function() {},
        submit: function() {}
      }, options);
      input = null;
      element = $('<li class="annotator-item" />');
      field.element = element[0];
      switch (field.type) {
        case 'textarea':
          input = $('<textarea />');
          break;
        case 'input':
        case 'checkbox':
          input = $('<input />');
          break;
        case 'select':
          input = $('<select />');
      }
      element.append(input);
      input.attr({
        id: field.id,
        placeholder: field.label
      });
      if (field.type === 'checkbox') {
        input[0].type = 'checkbox';
        element.addClass('annotator-checkbox');
        element.append($('<label />', {
          "for": field.id,
          html: field.label
        }));
      }
      this.element.find('ul:first').append(element);
      this.fields.push(field);
      return field.element;
    };

    Editor.prototype.checkOrientation = function() {
      var controls, list;
      Editor.__super__.checkOrientation.apply(this, arguments);
      list = this.element.find('ul');
      controls = this.element.find('.annotator-controls');
      if (this.element.hasClass(this.classes.invert.y)) {
        controls.insertBefore(list);
      } else if (controls.is(':first-child')) {
        controls.insertAfter(list);
      }
      return this;
    };

    Editor.prototype.processKeypress = function(event) {
      if (event.keyCode === 27) {
        return this.hide();
      } else if (event.keyCode === 13 && !event.shiftKey) {
        return this.submit();
      }
    };

    Editor.prototype.onCancelButtonMouseover = function() {
      return this.element.find('.' + this.classes.focus).removeClass(this.classes.focus);
    };

    Editor.prototype.setupDraggables = function() {
      var classes, controls, cornerItem, editor, mousedown, onMousedown, onMousemove, onMouseup, resize, textarea, throttle;
      this.element.find('.annotator-resize').remove();
      if (this.element.hasClass(this.classes.invert.y)) {
        cornerItem = this.element.find('.annotator-item:last');
      } else {
        cornerItem = this.element.find('.annotator-item:first');
      }
      if (cornerItem) {
        $('<span class="annotator-resize"></span>').appendTo(cornerItem);
      }
      mousedown = null;
      classes = this.classes;
      editor = this.element;
      textarea = null;
      resize = editor.find('.annotator-resize');
      controls = editor.find('.annotator-controls');
      throttle = false;
      onMousedown = function(event) {
        if (event.target === this) {
          mousedown = {
            element: this,
            top: event.pageY,
            left: event.pageX
          };
          textarea = editor.find('textarea:first');
          $(window).bind({
            'mouseup.annotator-editor-resize': onMouseup,
            'mousemove.annotator-editor-resize': onMousemove
          });
          return event.preventDefault();
        }
      };
      onMouseup = function() {
        mousedown = null;
        return $(window).unbind('.annotator-editor-resize');
      };
      onMousemove = (function(_this) {
        return function(event) {
          var diff, directionX, directionY, height, width;
          if (mousedown && throttle === false) {
            diff = {
              top: event.pageY - mousedown.top,
              left: event.pageX - mousedown.left
            };
            if (mousedown.element === resize[0]) {
              height = textarea.outerHeight();
              width = textarea.outerWidth();
              directionX = editor.hasClass(classes.invert.x) ? -1 : 1;
              directionY = editor.hasClass(classes.invert.y) ? 1 : -1;
              textarea.height(height + (diff.top * directionY));
              textarea.width(width + (diff.left * directionX));
              if (textarea.outerHeight() !== height) {
                mousedown.top = event.pageY;
              }
              if (textarea.outerWidth() !== width) {
                mousedown.left = event.pageX;
              }
            } else if (mousedown.element === controls[0]) {
              editor.css({
                top: parseInt(editor.css('top'), 10) + diff.top,
                left: parseInt(editor.css('left'), 10) + diff.left
              });
              mousedown.top = event.pageY;
              mousedown.left = event.pageX;
            }
            throttle = true;
            return setTimeout(function() {
              return throttle = false;
            }, 1000 / 60);
          }
        };
      })(this);
      resize.bind('mousedown', onMousedown);
      return controls.bind('mousedown', onMousedown);
    };

    return Editor;

  })(Annotator.Widget);

  Annotator.Viewer = (function(_super) {
    __extends(Viewer, _super);

    Viewer.prototype.events = {
      ".annotator-edit click": "onEditClick",
      ".annotator-delete click": "onDeleteClick"
    };

    Viewer.prototype.classes = {
      hide: 'annotator-hide',
      showControls: 'annotator-visible'
    };

    Viewer.prototype.html = {
      element: "<div class=\"annotator-outer annotator-viewer\">\n  <ul class=\"annotator-widget annotator-listing\"></ul>\n</div>",
      item: "<li class=\"annotator-annotation annotator-item\">\n  <span class=\"annotator-controls\">\n    <a href=\"#\" title=\"View as webpage\" class=\"annotator-link\">View as webpage</a>\n    <button title=\"Edit\" class=\"annotator-edit\">Edit</button>\n    <button title=\"Delete\" class=\"annotator-delete\">Delete</button>\n  </span>\n</li>"
    };

    Viewer.prototype.options = {
      readOnly: false
    };

    function Viewer(options) {
      this.onDeleteClick = __bind(this.onDeleteClick, this);
      this.onEditClick = __bind(this.onEditClick, this);
      this.load = __bind(this.load, this);
      this.hide = __bind(this.hide, this);
      this.show = __bind(this.show, this);
      Viewer.__super__.constructor.call(this, $(this.html.element)[0], options);
      this.item = $(this.html.item)[0];
      this.fields = [];
      this.annotations = [];
    }

    Viewer.prototype.show = function(event) {
      var controls;
      Annotator.Util.preventEventDefault(event);
      controls = this.element.find('.annotator-controls').addClass(this.classes.showControls);
      setTimeout(((function(_this) {
        return function() {
          return controls.removeClass(_this.classes.showControls);
        };
      })(this)), 500);
      this.element.removeClass(this.classes.hide);
      return this.checkOrientation().publish('show');
    };

    Viewer.prototype.isShown = function() {
      return !this.element.hasClass(this.classes.hide);
    };

    Viewer.prototype.hide = function(event) {
      Annotator.Util.preventEventDefault(event);
      this.element.addClass(this.classes.hide);
      return this.publish('hide');
    };

    Viewer.prototype.load = function(annotations) {
      var annotation, controller, controls, del, edit, element, field, item, link, links, list, _k, _l, _len2, _len3, _ref2, _ref3;
      this.annotations = annotations || [];
      list = this.element.find('ul:first').empty();
      _ref2 = this.annotations;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        annotation = _ref2[_k];
        item = $(this.item).clone().appendTo(list).data('annotation', annotation);
        controls = item.find('.annotator-controls');
        link = controls.find('.annotator-link');
        edit = controls.find('.annotator-edit');
        del = controls.find('.annotator-delete');
        links = new LinkParser(annotation.links || []).get('alternate', {
          'type': 'text/html'
        });
        if (links.length === 0 || (links[0].href == null)) {
          link.remove();
        } else {
          link.attr('href', links[0].href);
        }
        if (this.options.readOnly) {
          edit.remove();
          del.remove();
        } else {
          controller = {
            showEdit: function() {
              return edit.removeAttr('disabled');
            },
            hideEdit: function() {
              return edit.attr('disabled', 'disabled');
            },
            showDelete: function() {
              return del.removeAttr('disabled');
            },
            hideDelete: function() {
              return del.attr('disabled', 'disabled');
            }
          };
        }
        _ref3 = this.fields;
        for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
          field = _ref3[_l];
          element = $(field.element).clone().appendTo(item)[0];
          field.load(element, annotation, controller);
        }
      }
      this.publish('load', [this.annotations]);
      return this.show();
    };

    Viewer.prototype.addField = function(options) {
      var field;
      field = $.extend({
        load: function() {}
      }, options);
      field.element = $('<div />')[0];
      this.fields.push(field);
      field.element;
      return this;
    };

    Viewer.prototype.onEditClick = function(event) {
      return this.onButtonClick(event, 'edit');
    };

    Viewer.prototype.onDeleteClick = function(event) {
      return this.onButtonClick(event, 'delete');
    };

    Viewer.prototype.onButtonClick = function(event, type) {
      var item;
      item = $(event.target).parents('.annotator-annotation');
      return this.publish(type, [item.data('annotation')]);
    };

    return Viewer;

  })(Annotator.Widget);

  LinkParser = (function() {
    function LinkParser(data) {
      this.data = data;
    }

    LinkParser.prototype.get = function(rel, cond) {
      var d, k, keys, match, v, _k, _len2, _ref2, _results;
      if (cond == null) {
        cond = {};
      }
      cond = $.extend({}, cond, {
        rel: rel
      });
      keys = (function() {
        var _results;
        _results = [];
        for (k in cond) {
          if (!__hasProp.call(cond, k)) continue;
          v = cond[k];
          _results.push(k);
        }
        return _results;
      })();
      _ref2 = this.data;
      _results = [];
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        d = _ref2[_k];
        match = keys.reduce((function(m, k) {
          return m && (d[k] === cond[k]);
        }), true);
        if (match) {
          _results.push(d);
        } else {
          continue;
        }
      }
      return _results;
    };

    return LinkParser;

  })();

  Annotator = Annotator || {};

  Annotator.Notification = (function(_super) {
    __extends(Notification, _super);

    Notification.prototype.events = {
      "click": "hide"
    };

    Notification.prototype.options = {
      html: "<div class='annotator-notice'></div>",
      classes: {
        show: "annotator-notice-show",
        info: "annotator-notice-info",
        success: "annotator-notice-success",
        error: "annotator-notice-error"
      }
    };

    function Notification(options) {
      this.hide = __bind(this.hide, this);
      this.show = __bind(this.show, this);
      Notification.__super__.constructor.call(this, $(this.options.html).appendTo(document.body)[0], options);
    }

    Notification.prototype.show = function(message, status) {
      if (status == null) {
        status = Annotator.Notification.INFO;
      }
      this.currentStatus = status;
      $(this.element).addClass(this.options.classes.show).addClass(this.options.classes[this.currentStatus]).html(Util.escape(message || ""));
      setTimeout(this.hide, 5000);
      return this;
    };

    Notification.prototype.hide = function() {
      if (this.currentStatus == null) {
        this.currentStatus = Annotator.Notification.INFO;
      }
      $(this.element).removeClass(this.options.classes.show).removeClass(this.options.classes[this.currentStatus]);
      return this;
    };

    return Notification;

  })(Delegator);

  Annotator.Notification.INFO = 'info';

  Annotator.Notification.SUCCESS = 'success';

  Annotator.Notification.ERROR = 'error';

  $(function() {
    var notification;
    notification = new Annotator.Notification;
    Annotator.showNotification = notification.show;
    return Annotator.hideNotification = notification.hide;
  });

  Annotator.Plugin.Unsupported = (function(_super) {
    __extends(Unsupported, _super);

    function Unsupported() {
      return Unsupported.__super__.constructor.apply(this, arguments);
    }

    Unsupported.prototype.options = {
      message: Annotator._t("Sorry your current browser does not support the Annotator")
    };

    Unsupported.prototype.pluginInit = function() {
      if (!Annotator.supported()) {
        return $((function(_this) {
          return function() {
            Annotator.showNotification(_this.options.message);
            if ((window.XMLHttpRequest === void 0) && (ActiveXObject !== void 0)) {
              return $('html').addClass('ie6');
            }
          };
        })(this));
      }
    };

    return Unsupported;

  })(Annotator.Plugin);

  createDateFromISO8601 = function(string) {
    var d, date, offset, regexp, time, _ref2;
    regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" + "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\\.([0-9]+))?)?" + "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
    d = string.match(new RegExp(regexp));
    offset = 0;
    date = new Date(d[1], 0, 1);
    if (d[3]) {
      date.setMonth(d[3] - 1);
    }
    if (d[5]) {
      date.setDate(d[5]);
    }
    if (d[7]) {
      date.setHours(d[7]);
    }
    if (d[8]) {
      date.setMinutes(d[8]);
    }
    if (d[10]) {
      date.setSeconds(d[10]);
    }
    if (d[12]) {
      date.setMilliseconds(Number("0." + d[12]) * 1000);
    }
    if (d[14]) {
      offset = (Number(d[16]) * 60) + Number(d[17]);
      offset *= (_ref2 = d[15] === '-') != null ? _ref2 : {
        1: -1
      };
    }
    offset -= date.getTimezoneOffset();
    time = Number(date) + (offset * 60 * 1000);
    date.setTime(Number(time));
    return date;
  };

  base64Decode = function(data) {
    var ac, b64, bits, dec, h1, h2, h3, h4, i, o1, o2, o3, tmp_arr;
    if (typeof atob !== "undefined" && atob !== null) {
      return atob(data);
    } else {
      b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      i = 0;
      ac = 0;
      dec = "";
      tmp_arr = [];
      if (!data) {
        return data;
      }
      data += '';
      while (i < data.length) {
        h1 = b64.indexOf(data.charAt(i++));
        h2 = b64.indexOf(data.charAt(i++));
        h3 = b64.indexOf(data.charAt(i++));
        h4 = b64.indexOf(data.charAt(i++));
        bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
        o1 = bits >> 16 & 0xff;
        o2 = bits >> 8 & 0xff;
        o3 = bits & 0xff;
        if (h3 === 64) {
          tmp_arr[ac++] = String.fromCharCode(o1);
        } else if (h4 === 64) {
          tmp_arr[ac++] = String.fromCharCode(o1, o2);
        } else {
          tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
        }
      }
      return tmp_arr.join('');
    }
  };

  base64UrlDecode = function(data) {
    var i, m, _k, _ref2;
    m = data.length % 4;
    if (m !== 0) {
      for (i = _k = 0, _ref2 = 4 - m; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; i = 0 <= _ref2 ? ++_k : --_k) {
        data += '=';
      }
    }
    data = data.replace(/-/g, '+');
    data = data.replace(/_/g, '/');
    return base64Decode(data);
  };

  parseToken = function(token) {
    var head, payload, sig, _ref2;
    _ref2 = token.split('.'), head = _ref2[0], payload = _ref2[1], sig = _ref2[2];
    return JSON.parse(base64UrlDecode(payload));
  };

  Annotator.Plugin.Auth = (function(_super) {
    __extends(Auth, _super);

    Auth.prototype.options = {
      token: null,
      tokenUrl: '/auth/token',
      autoFetch: true
    };

    function Auth(element, options) {
      Auth.__super__.constructor.apply(this, arguments);
      this.waitingForToken = [];
      if (this.options.token) {
        this.setToken(this.options.token);
      } else {
        this.requestToken();
      }
    }

    Auth.prototype.requestToken = function() {
      this.requestInProgress = true;
      return $.ajax({
        url: this.options.tokenUrl,
        dataType: 'text',
        xhrFields: {
          withCredentials: true
        }
      }).done((function(_this) {
        return function(data, status, xhr) {
          return _this.setToken(data);
        };
      })(this)).fail((function(_this) {
        return function(xhr, status, err) {
          var msg;
          msg = Annotator._t("Couldn't get auth token:");
          console.error("" + msg + " " + err, xhr);
          return Annotator.showNotification("" + msg + " " + xhr.responseText, Annotator.Notification.ERROR);
        };
      })(this)).always((function(_this) {
        return function() {
          return _this.requestInProgress = false;
        };
      })(this));
    };

    Auth.prototype.setToken = function(token) {
      var _results;
      this.token = token;
      this._unsafeToken = parseToken(token);
      if (this.haveValidToken()) {
        if (this.options.autoFetch) {
          this.refreshTimeout = setTimeout(((function(_this) {
            return function() {
              return _this.requestToken();
            };
          })(this)), (this.timeToExpiry() - 2) * 1000);
        }
        this.updateHeaders();
        _results = [];
        while (this.waitingForToken.length > 0) {
          _results.push(this.waitingForToken.pop()(this._unsafeToken));
        }
        return _results;
      } else {
        console.warn(Annotator._t("Didn't get a valid token."));
        if (this.options.autoFetch) {
          console.warn(Annotator._t("Getting a new token in 10s."));
          return setTimeout(((function(_this) {
            return function() {
              return _this.requestToken();
            };
          })(this)), 10 * 1000);
        }
      }
    };

    Auth.prototype.haveValidToken = function() {
      var allFields;
      allFields = this._unsafeToken && this._unsafeToken.issuedAt && this._unsafeToken.ttl && this._unsafeToken.consumerKey;
      if (allFields && this.timeToExpiry() > 0) {
        return true;
      } else {
        return false;
      }
    };

    Auth.prototype.timeToExpiry = function() {
      var expiry, issue, now, timeToExpiry;
      now = new Date().getTime() / 1000;
      issue = createDateFromISO8601(this._unsafeToken.issuedAt).getTime() / 1000;
      expiry = issue + this._unsafeToken.ttl;
      timeToExpiry = expiry - now;
      if (timeToExpiry > 0) {
        return timeToExpiry;
      } else {
        return 0;
      }
    };

    Auth.prototype.updateHeaders = function() {
      var current;
      current = this.element.data('annotator:headers');
      return this.element.data('annotator:headers', $.extend(current, {
        'x-annotator-auth-token': this.token
      }));
    };

    Auth.prototype.withToken = function(callback) {
      if (callback == null) {
        return;
      }
      if (this.haveValidToken()) {
        return callback(this._unsafeToken);
      } else {
        this.waitingForToken.push(callback);
        if (!this.requestInProgress) {
          return this.requestToken();
        }
      }
    };

    return Auth;

  })(Annotator.Plugin);

  Annotator.Plugin.Store = (function(_super) {
    __extends(Store, _super);

    Store.prototype.events = {
      'annotationCreated': 'annotationCreated',
      'annotationDeleted': 'annotationDeleted',
      'annotationUpdated': 'annotationUpdated'
    };

    Store.prototype.options = {
      annotationData: {},
      emulateHTTP: false,
      loadFromSearch: false,
      prefix: '/store',
      urls: {
        create: '/annotations',
        read: '/annotations/:id',
        update: '/annotations/:id',
        destroy: '/annotations/:id',
        search: '/search'
      }
    };

    function Store(element, options) {
      this._onError = __bind(this._onError, this);
      this._onLoadAnnotationsFromSearch = __bind(this._onLoadAnnotationsFromSearch, this);
      this._onLoadAnnotations = __bind(this._onLoadAnnotations, this);
      this._getAnnotations = __bind(this._getAnnotations, this);
      Store.__super__.constructor.apply(this, arguments);
      this.annotations = [];
    }

    Store.prototype.pluginInit = function() {
      if (!Annotator.supported()) {
        return;
      }
      if (this.annotator.plugins.Auth) {
        return this.annotator.plugins.Auth.withToken(this._getAnnotations);
      } else {
        return this._getAnnotations();
      }
    };

    Store.prototype._getAnnotations = function() {
      if (this.options.loadFromSearch) {
        return this.loadAnnotationsFromSearch(this.options.loadFromSearch);
      } else {
        return this.loadAnnotations();
      }
    };

    Store.prototype.annotationCreated = function(annotation) {
      if (__indexOf.call(this.annotations, annotation) < 0) {
        this.registerAnnotation(annotation);
        return this._apiRequest('create', annotation, (function(_this) {
          return function(data) {
            if (data.id == null) {
              console.warn(Annotator._t("Warning: No ID returned from server for annotation "), annotation);
            }
            return _this.updateAnnotation(annotation, data);
          };
        })(this));
      } else {
        return this.updateAnnotation(annotation, {});
      }
    };

    Store.prototype.annotationUpdated = function(annotation) {
      if (__indexOf.call(this.annotations, annotation) >= 0) {
        return this._apiRequest('update', annotation, ((function(_this) {
          return function(data) {
            return _this.updateAnnotation(annotation, data);
          };
        })(this)));
      }
    };

    Store.prototype.annotationDeleted = function(annotation) {
      if (__indexOf.call(this.annotations, annotation) >= 0) {
        return this._apiRequest('destroy', annotation, ((function(_this) {
          return function() {
            return _this.unregisterAnnotation(annotation);
          };
        })(this)));
      }
    };

    Store.prototype.registerAnnotation = function(annotation) {
      return this.annotations.push(annotation);
    };

    Store.prototype.unregisterAnnotation = function(annotation) {
      return this.annotations.splice(this.annotations.indexOf(annotation), 1);
    };

    Store.prototype.updateAnnotation = function(annotation, data) {
      if (__indexOf.call(this.annotations, annotation) < 0) {
        console.error(Annotator._t("Trying to update unregistered annotation!"));
      } else {
        $.extend(annotation, data);
      }
      return $(annotation.highlights).data('annotation', annotation);
    };

    Store.prototype.loadAnnotations = function() {
      return this._apiRequest('read', null, this._onLoadAnnotations);
    };

    Store.prototype._onLoadAnnotations = function(data) {
      var a, annotation, annotationMap, newData, _k, _l, _len2, _len3, _ref2;
      if (data == null) {
        data = [];
      }
      annotationMap = {};
      _ref2 = this.annotations;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        a = _ref2[_k];
        annotationMap[a.id] = a;
      }
      newData = [];
      for (_l = 0, _len3 = data.length; _l < _len3; _l++) {
        a = data[_l];
        if (annotationMap[a.id]) {
          annotation = annotationMap[a.id];
          this.updateAnnotation(annotation, a);
        } else {
          newData.push(a);
        }
      }
      this.annotations = this.annotations.concat(newData);
      return this.annotator.loadAnnotations(newData.slice());
    };

    Store.prototype.loadAnnotationsFromSearch = function(searchOptions) {
      return this._apiRequest('search', searchOptions, this._onLoadAnnotationsFromSearch);
    };

    Store.prototype._onLoadAnnotationsFromSearch = function(data) {
      if (data == null) {
        data = {};
      }
      return this._onLoadAnnotations(data.rows || []);
    };

    Store.prototype.dumpAnnotations = function() {
      var ann, _k, _len2, _ref2, _results;
      _ref2 = this.annotations;
      _results = [];
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        ann = _ref2[_k];
        _results.push(JSON.parse(this._dataFor(ann)));
      }
      return _results;
    };

    Store.prototype._apiRequest = function(action, obj, onSuccess) {
      var id, options, request, url;
      id = obj && obj.id;
      url = this._urlFor(action, id);
      options = this._apiRequestOptions(action, obj, onSuccess);
      request = $.ajax(url, options);
      request._id = id;
      request._action = action;
      return request;
    };

    Store.prototype._apiRequestOptions = function(action, obj, onSuccess) {
      var data, method, opts;
      method = this._methodFor(action);
      opts = {
        type: method,
        headers: this.element.data('annotator:headers'),
        dataType: "json",
        success: onSuccess || function() {},
        error: this._onError
      };
      if (this.options.emulateHTTP && (method === 'PUT' || method === 'DELETE')) {
        opts.headers = $.extend(opts.headers, {
          'X-HTTP-Method-Override': method
        });
        opts.type = 'POST';
      }
      if (action === "search") {
        opts = $.extend(opts, {
          data: obj
        });
        return opts;
      }
      data = obj && this._dataFor(obj);
      if (this.options.emulateJSON) {
        opts.data = {
          json: data
        };
        if (this.options.emulateHTTP) {
          opts.data._method = method;
        }
        return opts;
      }
      opts = $.extend(opts, {
        data: data,
        contentType: "application/json; charset=utf-8"
      });
      return opts;
    };

    Store.prototype._urlFor = function(action, id) {
      var url;
      url = this.options.prefix != null ? this.options.prefix : '';
      url += this.options.urls[action];
      url = url.replace(/\/:id/, id != null ? '/' + id : '');
      url = url.replace(/:id/, id != null ? id : '');
      return url;
    };

    Store.prototype._methodFor = function(action) {
      var table;
      table = {
        'create': 'POST',
        'read': 'GET',
        'update': 'PUT',
        'destroy': 'DELETE',
        'search': 'GET'
      };
      return table[action];
    };

    Store.prototype._dataFor = function(annotation) {
      var data, highlights;
      highlights = annotation.highlights;
      delete annotation.highlights;
      $.extend(annotation, this.options.annotationData);
      data = JSON.stringify(annotation);
      if (highlights) {
        annotation.highlights = highlights;
      }
      return data;
    };

    Store.prototype._onError = function(xhr) {
      var action, message;
      action = xhr._action;
      message = Annotator._t("Sorry we could not ") + action + Annotator._t(" this annotation");
      if (xhr._action === 'search') {
        message = Annotator._t("Sorry we could not search the store for annotations");
      } else if (xhr._action === 'read' && !xhr._id) {
        message = Annotator._t("Sorry we could not ") + action + Annotator._t(" the annotations from the store");
      }
      switch (xhr.status) {
        case 401:
          message = Annotator._t("Sorry you are not allowed to ") + action + Annotator._t(" this annotation");
          break;
        case 404:
          message = Annotator._t("Sorry we could not connect to the annotations store");
          break;
        case 500:
          message = Annotator._t("Sorry something went wrong with the annotation store");
      }
      Annotator.showNotification(message, Annotator.Notification.ERROR);
      return console.error(Annotator._t("API request failed:") + (" '" + xhr.status + "'"));
    };

    return Store;

  })(Annotator.Plugin);

  Annotator.Plugin.Permissions = (function(_super) {
    __extends(Permissions, _super);

    Permissions.prototype.events = {
      'beforeAnnotationCreated': 'addFieldsToAnnotation'
    };

    Permissions.prototype.options = {
      showViewPermissionsCheckbox: true,
      showEditPermissionsCheckbox: true,
      userId: function(user) {
        return user;
      },
      userString: function(user) {
        return user;
      },
      userAuthorize: function(action, annotation, user) {
        var token, tokens, _k, _len2;
        if (annotation.permissions) {
          tokens = annotation.permissions[action] || [];
          if (tokens.length === 0) {
            return true;
          }
          for (_k = 0, _len2 = tokens.length; _k < _len2; _k++) {
            token = tokens[_k];
            if (this.userId(user) === token) {
              return true;
            }
          }
          return false;
        } else if (annotation.user) {
          if (user) {
            return this.userId(user) === this.userId(annotation.user);
          } else {
            return false;
          }
        }
        return true;
      },
      user: '',
      permissions: {
        'read': [],
        'update': [],
        'delete': [],
        'admin': []
      }
    };

    function Permissions(element, options) {
      this._setAuthFromToken = __bind(this._setAuthFromToken, this);
      this.updateViewer = __bind(this.updateViewer, this);
      this.updateAnnotationPermissions = __bind(this.updateAnnotationPermissions, this);
      this.updatePermissionsField = __bind(this.updatePermissionsField, this);
      this.addFieldsToAnnotation = __bind(this.addFieldsToAnnotation, this);
      Permissions.__super__.constructor.apply(this, arguments);
      if (this.options.user) {
        this.setUser(this.options.user);
        delete this.options.user;
      }
    }

    Permissions.prototype.pluginInit = function() {
      var createCallback, self;
      if (!Annotator.supported()) {
        return;
      }
      self = this;
      createCallback = function(method, type) {
        return function(field, annotation) {
          return self[method].call(self, type, field, annotation);
        };
      };
      if (!this.user && this.annotator.plugins.Auth) {
        this.annotator.plugins.Auth.withToken(this._setAuthFromToken);
      }
      if (this.options.showViewPermissionsCheckbox === true) {
        this.annotator.editor.addField({
          type: 'checkbox',
          label: Annotator._t('Allow anyone to <strong>view</strong> this annotation'),
          load: createCallback('updatePermissionsField', 'read'),
          submit: createCallback('updateAnnotationPermissions', 'read')
        });
      }
      if (this.options.showEditPermissionsCheckbox === true) {
        this.annotator.editor.addField({
          type: 'checkbox',
          label: Annotator._t('Allow anyone to <strong>edit</strong> this annotation'),
          load: createCallback('updatePermissionsField', 'update'),
          submit: createCallback('updateAnnotationPermissions', 'update')
        });
      }
      this.annotator.viewer.addField({
        load: this.updateViewer
      });
      if (this.annotator.plugins.Filter) {
        return this.annotator.plugins.Filter.addFilter({
          label: Annotator._t('User'),
          property: 'user',
          isFiltered: (function(_this) {
            return function(input, user) {
              var keyword, _k, _len2, _ref2;
              user = _this.options.userString(user);
              if (!(input && user)) {
                return false;
              }
              _ref2 = input.split(/\s*/);
              for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
                keyword = _ref2[_k];
                if (user.indexOf(keyword) === -1) {
                  return false;
                }
              }
              return true;
            };
          })(this)
        });
      }
    };

    Permissions.prototype.setUser = function(user) {
      return this.user = user;
    };

    Permissions.prototype.addFieldsToAnnotation = function(annotation) {
      if (annotation) {
        annotation.permissions = this.options.permissions;
        if (this.user) {
          return annotation.user = this.user;
        }
      }
    };

    Permissions.prototype.authorize = function(action, annotation, user) {
      if (user === void 0) {
        user = this.user;
      }
      if (this.options.userAuthorize) {
        return this.options.userAuthorize.call(this.options, action, annotation, user);
      } else {
        return true;
      }
    };

    Permissions.prototype.updatePermissionsField = function(action, field, annotation) {
      var input;
      field = $(field).show();
      input = field.find('input').removeAttr('disabled');
      if (!this.authorize('admin', annotation)) {
        field.hide();
      }
      if (this.authorize(action, annotation || {}, null)) {
        return input.attr('checked', 'checked');
      } else {
        return input.removeAttr('checked');
      }
    };

    Permissions.prototype.updateAnnotationPermissions = function(type, field, annotation) {
      var dataKey;
      if (!annotation.permissions) {
        annotation.permissions = this.options.permissions;
      }
      dataKey = type + '-permissions';
      if ($(field).find('input').is(':checked')) {
        return annotation.permissions[type] = [];
      } else {
        return annotation.permissions[type] = [this.options.userId(this.user)];
      }
    };

    Permissions.prototype.updateViewer = function(field, annotation, controls) {
      var user, username;
      field = $(field);
      username = this.options.userString(annotation.user);
      if (annotation.user && username && typeof username === 'string') {
        user = Annotator.Util.escape(this.options.userString(annotation.user));
        field.html(user).addClass('annotator-user');
      } else {
        field.remove();
      }
      if (controls) {
        if (!this.authorize('update', annotation)) {
          controls.hideEdit();
        }
        if (!this.authorize('delete', annotation)) {
          return controls.hideDelete();
        }
      }
    };

    Permissions.prototype._setAuthFromToken = function(token) {
      return this.setUser(token.userId);
    };

    return Permissions;

  })(Annotator.Plugin);

  Annotator.Plugin.AnnotateItPermissions = (function(_super) {
    __extends(AnnotateItPermissions, _super);

    function AnnotateItPermissions() {
      this._setAuthFromToken = __bind(this._setAuthFromToken, this);
      this.updateAnnotationPermissions = __bind(this.updateAnnotationPermissions, this);
      this.updatePermissionsField = __bind(this.updatePermissionsField, this);
      this.addFieldsToAnnotation = __bind(this.addFieldsToAnnotation, this);
      return AnnotateItPermissions.__super__.constructor.apply(this, arguments);
    }

    AnnotateItPermissions.prototype.options = {
      showViewPermissionsCheckbox: true,
      showEditPermissionsCheckbox: true,
      groups: {
        world: 'group:__world__',
        authenticated: 'group:__authenticated__',
        consumer: 'group:__consumer__'
      },
      userId: function(user) {
        return user.userId;
      },
      userString: function(user) {
        return user.userId;
      },
      userAuthorize: function(action, annotation, user) {
        var action_field, permissions, _ref2, _ref3, _ref4, _ref5;
        permissions = annotation.permissions || {};
        action_field = permissions[action] || [];
        if (_ref2 = this.groups.world, __indexOf.call(action_field, _ref2) >= 0) {
          return true;
        } else if ((user != null) && (user.userId != null) && (user.consumerKey != null)) {
          if (user.userId === annotation.user && user.consumerKey === annotation.consumer) {
            return true;
          } else if (_ref3 = this.groups.authenticated, __indexOf.call(action_field, _ref3) >= 0) {
            return true;
          } else if (user.consumerKey === annotation.consumer && (_ref4 = this.groups.consumer, __indexOf.call(action_field, _ref4) >= 0)) {
            return true;
          } else if (user.consumerKey === annotation.consumer && (_ref5 = user.userId, __indexOf.call(action_field, _ref5) >= 0)) {
            return true;
          } else if (user.consumerKey === annotation.consumer && user.admin) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      },
      permissions: {
        'read': ['group:__world__'],
        'update': [],
        'delete': [],
        'admin': []
      }
    };

    AnnotateItPermissions.prototype.addFieldsToAnnotation = function(annotation) {
      if (annotation) {
        annotation.permissions = this.options.permissions;
        if (this.user) {
          annotation.user = this.user.userId;
          return annotation.consumer = this.user.consumerKey;
        }
      }
    };

    AnnotateItPermissions.prototype.updatePermissionsField = function(action, field, annotation) {
      var input;
      field = $(field).show();
      input = field.find('input').removeAttr('disabled');
      if (!this.authorize('admin', annotation)) {
        field.hide();
      }
      if (this.user && this.authorize(action, annotation || {}, {
        userId: '__nonexistentuser__',
        consumerKey: this.user.consumerKey
      })) {
        return input.attr('checked', 'checked');
      } else {
        return input.removeAttr('checked');
      }
    };

    AnnotateItPermissions.prototype.updateAnnotationPermissions = function(type, field, annotation) {
      var dataKey;
      if (!annotation.permissions) {
        annotation.permissions = this.options.permissions;
      }
      dataKey = type + '-permissions';
      if ($(field).find('input').is(':checked')) {
        return annotation.permissions[type] = [type === 'read' ? this.options.groups.world : this.options.groups.consumer];
      } else {
        return annotation.permissions[type] = [];
      }
    };

    AnnotateItPermissions.prototype._setAuthFromToken = function(token) {
      return this.setUser(token);
    };

    return AnnotateItPermissions;

  })(Annotator.Plugin.Permissions);

  Annotator.Plugin.Filter = (function(_super) {
    __extends(Filter, _super);

    Filter.prototype.events = {
      ".annotator-filter-property input focus": "_onFilterFocus",
      ".annotator-filter-property input blur": "_onFilterBlur",
      ".annotator-filter-property input keyup": "_onFilterKeyup",
      ".annotator-filter-previous click": "_onPreviousClick",
      ".annotator-filter-next click": "_onNextClick",
      ".annotator-filter-clear click": "_onClearClick"
    };

    Filter.prototype.classes = {
      active: 'annotator-filter-active',
      hl: {
        hide: 'annotator-hl-filtered',
        active: 'annotator-hl-active'
      }
    };

    Filter.prototype.html = {
      element: "<div class=\"annotator-filter\">\n  <strong>" + Annotator._t('Navigate:') + "</strong>\n<span class=\"annotator-filter-navigation\">\n  <button class=\"annotator-filter-previous\">" + Annotator._t('Previous') + "</button>\n<button class=\"annotator-filter-next\">" + Annotator._t('Next') + "</button>\n</span>\n<strong>" + Annotator._t('Filter by:') + "</strong>\n</div>",
      filter: "<span class=\"annotator-filter-property\">\n  <label></label>\n  <input/>\n  <button class=\"annotator-filter-clear\">" + Annotator._t('Clear') + "</button>\n</span>"
    };

    Filter.prototype.options = {
      appendTo: 'body',
      filters: [],
      addAnnotationFilter: true,
      isFiltered: function(input, property) {
        var keyword, _k, _len2, _ref2;
        if (!(input && property)) {
          return false;
        }
        _ref2 = input.split(/\s+/);
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          keyword = _ref2[_k];
          if (property.indexOf(keyword) === -1) {
            return false;
          }
        }
        return true;
      }
    };

    function Filter(element, options) {
      this._onPreviousClick = __bind(this._onPreviousClick, this);
      this._onNextClick = __bind(this._onNextClick, this);
      this._onFilterKeyup = __bind(this._onFilterKeyup, this);
      this._onFilterBlur = __bind(this._onFilterBlur, this);
      this._onFilterFocus = __bind(this._onFilterFocus, this);
      this.updateHighlights = __bind(this.updateHighlights, this);
      var _base;
      element = $(this.html.element).appendTo((options != null ? options.appendTo : void 0) || this.options.appendTo);
      Filter.__super__.constructor.call(this, element, options);
      (_base = this.options).filters || (_base.filters = []);
      this.filter = $(this.html.filter);
      this.filters = [];
      this.current = 0;
    }

    Filter.prototype.pluginInit = function() {
      var filter, _k, _len2, _ref2;
      _ref2 = this.options.filters;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        filter = _ref2[_k];
        this.addFilter(filter);
      }
      this.updateHighlights();
      this._setupListeners()._insertSpacer();
      if (this.options.addAnnotationFilter === true) {
        return this.addFilter({
          label: Annotator._t('Annotation'),
          property: 'text'
        });
      }
    };

    Filter.prototype.destroy = function() {
      var currentMargin, html;
      Filter.__super__.destroy.apply(this, arguments);
      html = $('html');
      currentMargin = parseInt(html.css('padding-top'), 10) || 0;
      html.css('padding-top', currentMargin - this.element.outerHeight());
      return this.element.remove();
    };

    Filter.prototype._insertSpacer = function() {
      var currentMargin, html;
      html = $('html');
      currentMargin = parseInt(html.css('padding-top'), 10) || 0;
      html.css('padding-top', currentMargin + this.element.outerHeight());
      return this;
    };

    Filter.prototype._setupListeners = function() {
      var event, events, _k, _len2;
      events = ['annotationsLoaded', 'annotationCreated', 'annotationUpdated', 'annotationDeleted'];
      for (_k = 0, _len2 = events.length; _k < _len2; _k++) {
        event = events[_k];
        this.annotator.subscribe(event, this.updateHighlights);
      }
      return this;
    };

    Filter.prototype.addFilter = function(options) {
      var f, filter;
      filter = $.extend({
        label: '',
        property: '',
        isFiltered: this.options.isFiltered
      }, options);
      if (!((function() {
        var _k, _len2, _ref2, _results;
        _ref2 = this.filters;
        _results = [];
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          f = _ref2[_k];
          if (f.property === filter.property) {
            _results.push(f);
          }
        }
        return _results;
      }).call(this)).length) {
        filter.id = 'annotator-filter-' + filter.property;
        filter.annotations = [];
        filter.element = this.filter.clone().appendTo(this.element);
        filter.element.find('label').html(filter.label).attr('for', filter.id);
        filter.element.find('input').attr({
          id: filter.id,
          placeholder: Annotator._t('Filter by ') + filter.label + '\u2026'
        });
        filter.element.find('button').hide();
        filter.element.data('filter', filter);
        this.filters.push(filter);
      }
      return this;
    };

    Filter.prototype.updateFilter = function(filter) {
      var annotation, annotations, input, property, _k, _len2, _ref2;
      filter.annotations = [];
      this.updateHighlights();
      this.resetHighlights();
      input = $.trim(filter.element.find('input').val());
      if (input) {
        annotations = this.highlights.map(function() {
          return $(this).data('annotation');
        });
        _ref2 = $.makeArray(annotations);
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          annotation = _ref2[_k];
          property = annotation[filter.property];
          if (filter.isFiltered(input, property)) {
            filter.annotations.push(annotation);
          }
        }
        return this.filterHighlights();
      }
    };

    Filter.prototype.updateHighlights = function() {
      this.highlights = this.annotator.element.find('.annotator-hl:visible');
      return this.filtered = this.highlights.not(this.classes.hl.hide);
    };

    Filter.prototype.filterHighlights = function() {
      var activeFilters, annotation, annotations, filtered, highlights, index, uniques, _k, _len2, _ref2;
      activeFilters = $.grep(this.filters, function(filter) {
        return !!filter.annotations.length;
      });
      filtered = ((_ref2 = activeFilters[0]) != null ? _ref2.annotations : void 0) || [];
      if (activeFilters.length > 1) {
        annotations = [];
        $.each(activeFilters, function() {
          return $.merge(annotations, this.annotations);
        });
        uniques = [];
        filtered = [];
        $.each(annotations, function() {
          if ($.inArray(this, uniques) === -1) {
            return uniques.push(this);
          } else {
            return filtered.push(this);
          }
        });
      }
      highlights = this.highlights;
      for (index = _k = 0, _len2 = filtered.length; _k < _len2; index = ++_k) {
        annotation = filtered[index];
        highlights = highlights.not(annotation.highlights);
      }
      highlights.addClass(this.classes.hl.hide);
      this.filtered = this.highlights.not(this.classes.hl.hide);
      return this;
    };

    Filter.prototype.resetHighlights = function() {
      this.highlights.removeClass(this.classes.hl.hide);
      this.filtered = this.highlights;
      return this;
    };

    Filter.prototype._onFilterFocus = function(event) {
      var input;
      input = $(event.target);
      input.parent().addClass(this.classes.active);
      return input.next('button').show();
    };

    Filter.prototype._onFilterBlur = function(event) {
      var input;
      if (!event.target.value) {
        input = $(event.target);
        input.parent().removeClass(this.classes.active);
        return input.next('button').hide();
      }
    };

    Filter.prototype._onFilterKeyup = function(event) {
      var filter;
      filter = $(event.target).parent().data('filter');
      if (filter) {
        return this.updateFilter(filter);
      }
    };

    Filter.prototype._findNextHighlight = function(previous) {
      var active, annotation, current, index, next, offset, operator, resetOffset;
      if (!this.highlights.length) {
        return this;
      }
      offset = previous ? 0 : -1;
      resetOffset = previous ? -1 : 0;
      operator = previous ? 'lt' : 'gt';
      active = this.highlights.not('.' + this.classes.hl.hide);
      current = active.filter('.' + this.classes.hl.active);
      if (!current.length) {
        current = active.eq(offset);
      }
      annotation = current.data('annotation');
      index = active.index(current[0]);
      next = active.filter(":" + operator + "(" + index + ")").not(annotation.highlights).eq(resetOffset);
      if (!next.length) {
        next = active.eq(resetOffset);
      }
      return this._scrollToHighlight(next.data('annotation').highlights);
    };

    Filter.prototype._onNextClick = function(event) {
      return this._findNextHighlight();
    };

    Filter.prototype._onPreviousClick = function(event) {
      return this._findNextHighlight(true);
    };

    Filter.prototype._scrollToHighlight = function(highlight) {
      highlight = $(highlight);
      this.highlights.removeClass(this.classes.hl.active);
      highlight.addClass(this.classes.hl.active);
      return $('html, body').animate({
        scrollTop: highlight.offset().top - (this.element.height() + 20)
      }, 150);
    };

    Filter.prototype._onClearClick = function(event) {
      return $(event.target).prev('input').val('').keyup().blur();
    };

    return Filter;

  })(Annotator.Plugin);

  Annotator.Plugin.Markdown = (function(_super) {
    __extends(Markdown, _super);

    Markdown.prototype.events = {
      'annotationViewerTextField': 'updateTextField'
    };

    function Markdown(element, options) {
      this.updateTextField = __bind(this.updateTextField, this);
      if ((typeof Showdown !== "undefined" && Showdown !== null ? Showdown.converter : void 0) != null) {
        Markdown.__super__.constructor.apply(this, arguments);
        this.converter = new Showdown.converter();
      } else {
        console.error(Annotator._t("To use the Markdown plugin, you must include Showdown into the page first."));
      }
    }

    Markdown.prototype.updateTextField = function(field, annotation) {
      var text;
      text = Annotator.Util.escape(annotation.text || '');
      return $(field).html(this.convert(text));
    };

    Markdown.prototype.convert = function(text) {
      return this.converter.makeHtml(text);
    };

    return Markdown;

  })(Annotator.Plugin);

  Annotator.Plugin.Tags = (function(_super) {
    __extends(Tags, _super);

    function Tags() {
      this.setAnnotationTags = __bind(this.setAnnotationTags, this);
      this.updateField = __bind(this.updateField, this);
      return Tags.__super__.constructor.apply(this, arguments);
    }

    Tags.prototype.options = {
      parseTags: function(string) {
        var tags;
        string = $.trim(string);
        tags = [];
        if (string) {
          tags = string.split(/\s+/);
        }
        return tags;
      },
      stringifyTags: function(array) {
        return array.join(" ");
      }
    };

    Tags.prototype.field = null;

    Tags.prototype.input = null;

    Tags.prototype.pluginInit = function() {
      if (!Annotator.supported()) {
        return;
      }
      this.field = this.annotator.editor.addField({
        label: Annotator._t('Add some tags here') + '\u2026',
        load: this.updateField,
        submit: this.setAnnotationTags
      });
      this.annotator.viewer.addField({
        load: this.updateViewer
      });
      if (this.annotator.plugins.Filter) {
        this.annotator.plugins.Filter.addFilter({
          label: Annotator._t('Tag'),
          property: 'tags',
          isFiltered: Annotator.Plugin.Tags.filterCallback
        });
      }
      return this.input = $(this.field).find(':input');
    };

    Tags.prototype.parseTags = function(string) {
      return this.options.parseTags(string);
    };

    Tags.prototype.stringifyTags = function(array) {
      return this.options.stringifyTags(array);
    };

    Tags.prototype.updateField = function(field, annotation) {
      var value;
      value = '';
      if (annotation.tags) {
        value = this.stringifyTags(annotation.tags);
      }
      return this.input.val(value);
    };

    Tags.prototype.setAnnotationTags = function(field, annotation) {
      return annotation.tags = this.parseTags(this.input.val());
    };

    Tags.prototype.updateViewer = function(field, annotation) {
      field = $(field);
      if (annotation.tags && $.isArray(annotation.tags) && annotation.tags.length) {
        return field.addClass('annotator-tags').html(function() {
          var string;
          return string = $.map(annotation.tags, function(tag) {
            return '<span class="annotator-tag">' + Annotator.Util.escape(tag) + '</span>';
          }).join(' ');
        });
      } else {
        return field.remove();
      }
    };

    return Tags;

  })(Annotator.Plugin);

  Annotator.Plugin.Tags.filterCallback = function(input, tags) {
    var keyword, keywords, matches, tag, _k, _l, _len2, _len3;
    if (tags == null) {
      tags = [];
    }
    matches = 0;
    keywords = [];
    if (input) {
      keywords = input.split(/\s+/g);
      for (_k = 0, _len2 = keywords.length; _k < _len2; _k++) {
        keyword = keywords[_k];
        if (tags.length) {
          for (_l = 0, _len3 = tags.length; _l < _len3; _l++) {
            tag = tags[_l];
            if (tag.indexOf(keyword) !== -1) {
              matches += 1;
            }
          }
        }
      }
    }
    return matches === keywords.length;
  };

  Annotator.prototype.setupPlugins = function(config, options) {
    var name, opts, pluginConfig, plugins, uri, win, _k, _len2, _results;
    if (config == null) {
      config = {};
    }
    if (options == null) {
      options = {};
    }
    win = Annotator.Util.getGlobal();
    plugins = ['Unsupported', 'Auth', 'Tags', 'Filter', 'Store', 'AnnotateItPermissions'];
    if (win.Showdown) {
      plugins.push('Markdown');
    }
    uri = win.location.href.split(/#|\?/).shift() || '';
    pluginConfig = {
      Tags: {},
      Filter: {
        filters: [
          {
            label: Annotator._t('User'),
            property: 'user'
          }, {
            label: Annotator._t('Tags'),
            property: 'tags'
          }
        ]
      },
      Auth: {
        tokenUrl: config.tokenUrl || 'http://annotateit.org/api/token'
      },
      Store: {
        prefix: config.storeUrl || 'http://annotateit.org/api',
        annotationData: {
          uri: uri
        },
        loadFromSearch: {
          uri: uri
        }
      }
    };
    for (name in options) {
      if (!__hasProp.call(options, name)) continue;
      opts = options[name];
      if (__indexOf.call(plugins, name) < 0) {
        plugins.push(name);
      }
    }
    $.extend(true, pluginConfig, options);
    _results = [];
    for (_k = 0, _len2 = plugins.length; _k < _len2; _k++) {
      name = plugins[_k];
      if (!(name in pluginConfig) || pluginConfig[name]) {
        _results.push(this.addPlugin(name, pluginConfig[name]));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

}).call(this);

//
//# sourceMappingURL=annotator-full.map
var _ref,__bind=function(a,b){return function(){return a.apply(b,arguments)}},__hasProp={}.hasOwnProperty,__extends=function(d,b){for(var a in b){if(__hasProp.call(b,a)){d[a]=b[a]}}function c(){this.constructor=d}c.prototype=b.prototype;d.prototype=new c();d.__super__=b.prototype;return d};Annotator.Plugin.RichText=(function(a){__extends(b,a);b.prototype.options={tinymce:{selector:"li.annotator-item textarea",plugins:"media image insertdatetime link code",menubar:false,toolbar_items_size:"small",extended_valid_elements:"iframe[src|frameborder|style|scrolling|class|width|height|name|align|id]",toolbar:"insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media rubric | code ",}};function b(d,c){_ref=b.__super__.constructor.apply(this,arguments);return _ref}b.prototype.pluginInit=function(){console.log("RichText-pluginInit");var d=this.annotator,c=this.annotator.editor;if(!Annotator.supported()){return}d.editor.addField({type:"input",load:this.updateEditor,});d.viewer.addField({load:this.updateViewer,});d.subscribe("annotationEditorShown",function(){$(d.editor.element).find(".mce-tinymce")[0].style.display="block";$(d.editor.element).find(".mce-container").css("z-index",3000000000);d.editor.checkOrientation()});d.subscribe("annotationEditorHidden",function(){$(d.editor.element).find(".mce-tinymce")[0].style.display="none"});this.options.tinymce.setup=function(e){e.on("change",function(f){$(c.element).find("textarea")[0].value=tinymce.activeEditor.getContent()});e.on("Init",function(f){$(".mce-container").css("z-index","3090000000000000000")});e.addButton("rubric",{icon:"rubric",title:"Insert a rubric",onclick:function(){e.windowManager.open({title:"Insert a public rubric of the webside https://gteavirtual.org/rubric   ",body:[{type:"textbox",name:"url",label:"Url"}],onsubmit:function(l){var h=l.data.url,g="irb",k;g=g.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");var j=new RegExp("[\\?&]"+g+"=([^&#]*)"),i=j.exec(h);k=i==null?"":decodeURIComponent(i[1].replace(/\+/g," "));if(k==""){e.windowManager.alert("Error: The given webpage didn't have a irb variable in the url")}else{var f="<iframe src='https://gteavirtual.org/rubric/?mod=portal&scr=viewrb&evt=frame&irb="+k+"' style='width:800px;height:600px;overflow-y: scroll;background:transparent' frameborder='0' ></iframe>";e.setContent(e.getContent()+f);$(c.element).find("textarea")[0].value=e.getContent()}}});e.insertContent("Main button");e.label="My Button"}})};tinymce.init(this.options.tinymce)};b.prototype.updateEditor=function(d,c){var e=typeof c.text!="undefined"?c.text:"";tinymce.activeEditor.setContent(e);$(d).remove()};b.prototype.updateViewer=function(e,c){var d=$(e.parentNode).find("div:first-of-type")[0];d.innerHTML=c.text;$(d).addClass("richText-annotation");$(e).remove()};return b})(Annotator.Plugin);
/**
 * Created by flyx on 7/22/15.
 */
Annotator.Plugin.ImageAnnotation = function (element, settings) {

    var scope = this;
    var _element = element;
    this.template = '';
    this.target = null;
    this.x = 0;
    this.y = 0;
    this.inEdit = false;

    this.init = function() {
        $('.annotator-wrapper')
            .append($('<div>').attr('id','img-anno-list'));

    };

    this.getSelectionText = function(){
        var text = "";
        if (window.getSelection) {
            text = window.getSelection().toString();
        } else if (document.selection && document.selection.type != "Control") {
            text = document.selection.createRange().text;
        }
        return text;
    };

    this.imageHoverListener = function(e) {
        if( scope.getSelectionText() == '') {
            scope.target = e.currentTarget;
            var offset = $('.annotator-wrapper').offset();
            var curX = e.pageX - offset.left;
            var curY = e.pageY - offset.top + 25;

            var editor = $('.annotator-editor');
            if (editor.css('display') == 'none'
                || editor.hasClass('annotator-hide')) {
                $('.annotator-adder')
                    .css('left', curX)
                    .css('top', curY)
                    .removeClass('annotator-hide')
                    .show();

            }

            if(!scope.inEdit) {
                scope.target = e.currentTarget;
                scope.x = e.pageX - $(scope.target).offset().left;
                scope.y = e.pageY - $(scope.target).offset().top;
            }


        }

    };

    this.imageInListener = function(e) {
        //滑鼠在圖片上時，是否要更新 adder 的座標
        if(scope.getSelectionText() == '' && !scope.inEdit) {
            scope.target = e.currentTarget;
            scope.x = e.pageX - $(scope.target).offset().left;
            scope.y = e.pageY - $(scope.target).offset().top;
        }
    };

    this.addHook = function() {

        $('.annotator-wrapper')
            .on('mousemove', function (e) {

                if( scope.getSelectionText() == '') {
                    var curX = e.pageX ;
                    var curY = e.pageY ;
                    var target = $(scope.target);
                    if (  scope.target != null
                        && !(scope.target != null
                        && ( curX >= target.offset().left
                        && curX <= target.offset().left + target.width()
                        && curY >= target.offset().top
                        && curY <= target.offset().top + target.height() ))) {

                        $('.annotator-adder').hide();

                    }
                }
            });

        //圖片hook
        $(_element)
            .find('img')
            .on('mousemove', this.imageHoverListener)
            .on('mouseenter', this.imageInListener);


        $('.annotator-adder')
            .on('click', function (e) {
                var offset = $('.annotator-wrapper').offset();
                var curX = e.pageX - offset.left;
                var curY = e.pageY - offset.top + 15;

                if(scope.getSelectionText() == '') {
                    scope.inEdit = true;
                    $('.annotator-editor')
                        .css('left', curX)
                        .css('top', curY)
                        .removeClass('annotator-hide')
                        .show();
                }
            });

        $('#cancel')
            .on('click', function(e) {
                scope.inEdit = false;
            });

        $(_element)
            .on('mouseover', '.anno-img-item', function(e) {
                $('.annotator-adder').hide();
            });
    };




    return {
        pluginInit: function () {

            scope.init();
            scope.addHook();

            this.annotator
                .subscribe("annotationCreated", function (annotation) {
                    if( scope.target != null ) {
                        annotation.type = 'image';
                        annotation.src = scope.target.src;
                        annotation.position = {
                            x: scope.x,
                            y: scope.y
                        };
                        if(annotation.type == 'image') {
                            var origin = $(".annotator-wrapper img[src='"+annotation.src+"']").position();
                            var x = parseInt(origin.left) + parseInt(annotation.position.x);
                            var y = parseInt(origin.top) + parseInt(annotation.position.y);
                            $('#img-anno-list')
                                .append($('<div>')
                                    .attr('id','img-anno-' + annotation.id)
                                    .addClass('fa').addClass('fa-chevron-circle-down')
                                    .addClass('fa-2x').addClass('annotator-hl').addClass('img-anno-item')
                                    .css({
                                        'position' :'absoulte',
                                        'z-index' : '999',
                                        'left' : x + 'px',
                                        'top' : y + 'px'
                                    }));

                            $('#img-anno-' + annotation.id)
                                .data('annotation', annotation);
                        }
                    }
                }).subscribe("annotationDeleted", function (annotation) {

                    if(annotation.type == 'image') {
                        $('#img-anno-' + annotation.id).remove();
                    }
                })
                .subscribe("annotationsLoaded", function (annotations) {
                    for(var i = 0 ; i < annotations.length; i++) {
                        var annotation = annotations[i];
                        if(annotation.type == 'image') {
                            var origin = $(".annotator-wrapper img[src='"+annotation.src+"']").position();
                            var x = parseInt(origin.left) + parseInt(annotation.position.x);
                            var y = parseInt(origin.top) + parseInt(annotation.position.y);
                            $('#img-anno-list')
                                .append($('<div>')
                                    .attr('id'+ 'img-anno-' + annotation.id)
                                    .addClass('fa').addClass('fa-chevron-circle-down').addClass('fa-2x')
                                    .addClass('annotator-hl').addClass('img-anno-item')
                                    .css( {
                                        'position' :'absoulte',
                                        'z-index' : '999',
                                        'left' : x + 'px',
                                        'top' : y + 'px'
                                    }));
                            $('#img-anno-' + annotation.id)
                                .data('annotation', annotation);
                        }
                    }
                });
        }
    }
}

/**
 * 顯示Annotation的插件
 */
Annotator.Plugin.ViewPanel = function (element, settings) {

    // storing object scope
    var _this = this;
    this.annotator = $(element).annotator().data('annotator');
    this.element = element;
    this.uri = settings.uri;
    // if uri not set , use web url in default
    if(this.uri == null)
        this.uri = location.href.split('#')[0];

    this.anno_token = settings.anno_token;
    this.target_anno = settings.target_anno;
    this.server = settings.server;

    this.domain = settings.domain;
    this.callback_url = location.href.split('#')[0];

    // Storing entire data;
    this.data = [];
    // Storing data that only showed;
    this.showing = [];
    // Mapping hights elements by id;
    this.maptoid= {};

    // Authed variable
    this.is_authed = false;

    // Panel Object
    this.ui = null;

    // API URLS
    this.postlikeUrl = 'http://' + this.server + '/api/likes';
    this.authCheckurl = 'http://' + this.server + '/api/check';
    this.loginUrl = 'http://' + this.server + '/auth/login?callback_url='
    + encodeURIComponent(this.callback_url)  + '&uri=' + this.uri + '&domain=' + this.domain ;
    this.logoutUrl = 'http://' + this.server + '/api/logout';

    this.showUI = true;
    this.user = null;

    //登入Anntation的 Modal UI
    this.insertAuthUI = function() {
        $('body').append('<div id="openAuthUI" class="authDialog">'
        + '     <div>'
        + '         <h2>本網站使用了標記的服務</h2>'
        + '         <span><a id="anno-btn-login" class="btn anno-btn-login">永久儲存標記</a></span>'
        + '         <span><a href="#" id="anno-btn-close" class="btn anno-btn-close">關閉視窗</a></span>'
        + '     </div>'
        + '</div>');

        $(document)
            .on('click', '#anno-btn-login', function(e) {
                location.href = _this.loginUrl;
            })
            .on('click', '#anno-btn-close', function(e) {
                $('#openAuthUI').removeClass('show');
                return false;
            });
    };

    this.insertPanelUI = function() {

        $('body').append(
            '<div class="anno-panel">' +
                '<div class="anno-login">' +
                '</div>' +
                '<div class="anno-search">' +
                    '<p><strong>搜尋標記內容</strong></p>' +
                    '<form action="#" id="form-search">' +
                        '<button id="anno-search-submit" type="submit">' +
                            '<i class="fa fa-search fa-2x"></i>' +
                        '</button>' +
                        '<input id="anno-search-input" type="text" />' +
                    '</form>' +
                '</div>' +
                '<div class="anno-users">' +
                    '<p><strong>在此網頁標記的人</strong></p>' +
                    '<ul>' +
                    '</ul>' +
                '</div>' +
                '<div class="anno-tags"><p><strong>標籤</strong></p>' +
                    '<ul>' +
                    '</ul>' +
                '</div>' +
                '<hr/>' +
                '<div class="anno-search-list">' +
                    '<ul>' +
                    '</ul>' +
                '</div>' +
                '<div class="btn-appear">' +
                '</div>' +
            '</div>');

        _this.ui = $('.anno-panel');

        //綁定搜尋按鈕事件
        $('#anno-search-submit').click(function(e) {
            e.preventDefault();
            //從Store插件找到搜尋的網址
            var url_search = _this.annotator.plugins.Store.options.urls.search;
            var data = _this.annotator.plugins.Store.options.loadFromSearch;
            data.search = _this.ui.find('#anno-search-input').val();
            $.ajax({
                url: url_search,
                data: data,
                dataType: 'json',
                success: function(data) {
                    _this.data = [];
                    $('.annotator-hl').not('.hl-keywords').removeClass('annotator-hl');
                    $('.anno-tags ul li').remove();
                    $('.anno-users ul li').remove();
                    _this.annotator.loadAnnotations(data.rows);
                }
            });
        });

        //綁定所有按讚事件
        $(document).on( 'click', '.anno-like',function(e) {
            e.preventDefault();
            var target = $(e.target);
            //標記ID
            var aid = target.attr('data-id');
            $.post(_this.postlikeUrl + "/" + aid, {
                anno_token : _this.anno_token,
                domain : _this.domain,
                like : '1'
            }).success(function(annotation) {
                target.parent().find('.annotator-likes-total').text(annotation.likes);
                if(_this.maptoid[annotation.id] != null) {
                    var highlights = _this.maptoid[annotation.id];
                    highlights.forEach(function(highlight, index , ary) {
                        $(highlight).data('annotation').likes = annotation.likes;
                    });
                }
            });

        }).on( 'click', '.anno-dislike',function(e) {
            e.preventDefault();
            var target = $(e.target);
            var aid = target.attr('data-id');
            $.post(_this.postlikeUrl + "/" + aid, {
                anno_token : _this.anno_token,
                domain : _this.domain,
                like : '-1'
            }).success(function(annotation) {
                target.parent().find('.annotator-likes-total').text(annotation.likes);
                if(_this.maptoid[annotation.id] != null) {
                    var highlights = _this.maptoid[annotation.id];
                    highlights.forEach(function(highlight, index , ary) {
                        $(highlight).data('annotation').likes = annotation.likes;
                    });
                }
            });

        });

        //登出事件
        $(document).on('click','#btn-anno-logout', function(e){
            e.preventDefault();
            $.ajax({
                method: 'POST',
                cookies: true,
                async: false,
                data: {
                    'anno_token': _this.anno_token,
                    'domain' : _this.domain
                },
                url : _this.logoutUrl,
            });
            setCookie('anno_token', '');
            setCookie('user_id', '');
            _this.is_authed = false;
            _this.anno_token = '';
            _this.checkLoginState(false);
            return false;
        });


        _this.ui.bind('mouseover', function(e){
            if(!_this.showUI) {
                _this.ui.stop().animate({
                    'right': '0'
                }, 500, 'linear');
                _this.showUI = true;
            }
        }).bind('mouseleave',  function(e){
            if(_this.showUI) {
                _this.ui.stop().animate({
                    'right': '-260px'
                }, 1000, 'linear');
                _this.showUI = false;
            }
        });
    };


    //檢查登入狀態函數
    this.checkLoginState = function(showUI, async) {

        if(!this.is_authed) {
            $.ajax({
                crossDomain : true,
                async : async === true ? true : false,
                dataType: 'json',
                data: {
                    'anno_token': this.anno_token,
                    'domain' : this.domain
                },
                url: this.authCheckurl,
                success : function(data) {
                    _this.user = data.user;
                    $('.anno-login').html(
                        '<img class="gravatar" src="'+ data.user.gravatar+'"/>' +
                        '<div>' +
                            '<span>'+ data.user.email +'</span>' +
                        '</div>' +
                        '<div>' +
                        '<span>' +
                            '<a href="#" id="btn-anno-logout">登出</a>' +
                        '</span>' +
                        '<span>' +
                            '<a target="_blank" href="http://' + _this.server + '">管理標記</a>' +
                        '</span>' +
                        '</div>');
                },
                statusCode: {
                    200 : function() {
                        _this.is_authed = true;
                    },
                    401: function () {
                        $('.anno-login').html('<div><span><a href="' + _this.loginUrl +'">登入</a></span></div>');
                        if(showUI != false)
                            $('#openAuthUI').addClass('show');
                    }
                }
            });
        }
    };


    this.refreshHighLights = function() {

        var filter_users = [];
        var filter_tags = [];
        var i;

        //抓出user list 跟 tag list 的勾選input
        var checkboxs = $('.anno-tags ul li input[type=checkbox],.anno-users ul li input[type=checkbox]');

        var tags_count = $('.anno-tags ul li input[type=checkbox]').length;



        for(i = 0 ; i < checkboxs.length; i++) {
            if(checkboxs[i].checked) {
                //種類
                var cls = $(checkboxs[i]).attr('data-search').split('-')[0];
                //id
                var val = $(checkboxs[i]).attr('data-search').split('-')[1];
                if( cls == 'user')
                {
                    filter_users.push(val);
                } else if ( cls == 'tag' ) {
                    filter_tags.push(val);
                }
            }
        }


        //顯示用的資料，完整的資料存在_this.data
        _this.showing = [];

        //開始搜尋
        for(i = 0 ; i < _this.data.length; i++)
        {
            var user = _this.data[i].user;

            _this.data[i].highlights = [];

            // 確認建立標記的使用者
            if (filter_users.indexOf(user.id.toString()) != -1) {
                //如果tag清單上沒有全部勾選 則確認標記的tag
                if(filter_tags.length != tags_count) {
                    var tags = _this.data[i].tags;
                    for (var j = 0; j < tags.length; j++) {
                        var tag = tags[j];
                        if (filter_tags.indexOf(tag) != -1) {
                            _this.showing.push(_this.data[i]);
                            break;
                        }
                    }
                } else {
                    _this.showing.push(_this.data[i]);
                }
            }

        }

        $('.annotator-hl').not('.hl-keywords').removeClass('annotator-hl');

        _this.annotator.loadAnnotations(_this.showing);

    };

    this.addReference = function(annotation) {

        var user_id;
        var gravatar_url = '#';

        // get user id from annotation
        if( annotation.user != null)
            user_id = annotation.user.id;

        if( user_id == null )
            user_id = _this.user.id;

        // not authed
        if( annotation.id == 0 || annotation.id == null)
            annotation.user = _this.user;

        var user = annotation.user;

        if ( user.gravatar == null)
            user = _this.user;

        // get user gravatar url
        gravatar_url = user.gravatar;



        // check user is added to userlist
        if( _this.ui.find('#anno-user-'+ user_id ).length == 0) {
            //add user list item and bind to user list
            _this.ui.find('.anno-users ul')
                .append('<li id="anno-user-' + user_id + '">' +
                            '<input type="checkbox" checked data-search="user-' + user_id + '"/>' +
                            '<img class="gravatar" src="'+ gravatar_url +'" alt=""/>' +
                            '<span>' + user.name +'</span>' +
                        '</li>');
            $('#anno-user-' + user_id)
                .find('input[type=checkbox]')
                .click(_this.refreshHighLights);
        }

        //add tag to tag list
        var tags = annotation.tags;

        if( Array.isArray(tags)) tags.forEach(function (tagName, index, tagsAry) {
            if (tagName !== '') {
                var tagId = 'anno-tag-' + tagName;
                if (!_this.ui.find('#' + tagId).length) {
                    _this.ui.find('.anno-tags ul')
                        .append($('<li>').attr('id', tagId)
                            .append($('<input>').attr('type', 'checkbox')
                                .attr('checked', '')
                                .attr('data-search', 'tag-' + tagName))
                            .append($('<span>').text(tagName)));
                    $('#' + tagId).find('input[type=checkbox]')
                        .click(_this.refreshHighLights);
                }
            }
        });
    };

    // add user filed to Annotation View
    this.updateCreatorViewer = function(field, annotation) {
        var user = annotation.user;
        console.log(user);
        if(user == null)
            user = _this.user;
        if(user.name != null ) {
            $(field)
                .addClass('annotator-user')
                .html($('<strong>').text('建立者: ')
                    .append($('<span>')
                        .text(user.name)));
        }
        return '';
    };

    this.updateDateViewer = function(field, annotation) {

        if(annotation.created_at != null ) {
            $(field)
                .addClass('annotator-date')
                .html($('<strong>').text('建立時間: ')
                    .append($('<span>')
                        .text(annotation.created_at)));
        }
        return '';
    };

    this.updateLikeViewer = function(field, annotation) {
        if(annotation.likes != undefined ){
            $(field)
                .addClass('annotator-mark')
                .html('<strong>評分: </strong>' +
                '<span class="annotator-likes">' +
                '<span class="annotator-likes-total">'+annotation.likes+'</span>' +
                '<a href="#" data-id="'+ annotation.id +'" class="anno-like fa fa-thumbs-up"></a>' +
                '<a href="#" data-id="'+ annotation.id +'" class="anno-dislike fa fa-thumbs-down"></a>' +
                '</span>');
        }

        return '';
    };

    return {
        pluginInit: function () {

            _this.insertPanelUI();
            _this.insertAuthUI();
            _this.checkLoginState(false);
            _this.annotator
                .subscribe("annotationsLoaded", function (annotations) {
                    if( _this.data.length == 0 )
                        _this.data = annotations;
                    annotations.forEach(function(annotation, index, annotations) {
                        var isInArray = $.inArray(_this.data, annotation);
                        if(~isInArray)
                            _this.data.push(annotation);
                        _this.addReference(annotation);
                        //建立 id以及被標記元素的map
                        if( annotation.highlights != null) {
                            _this.maptoid[annotation.id] = annotation.highlights;
                        }
                        // 當要顯示特定標記時，刪除其他標記的高亮
                        if(_this.target_anno != 0) {
                            if (annotation.id.toString() != _this.target_anno && annotation.highlights != null) {
                                annotation.highlights.forEach(function(highlight, index, highlights){
                                    $(highlight).not('.hl-keywords').removeClass('annotator-hl');
                                });
                            }

                        }
                    });

            }).subscribe("annotationCreated", function (annotation) {
                _this.checkLoginState();
                if(_this.data.indexOf(annotation) == -1)
                    _this.data.push(annotation);
                _this.addReference(annotation);
            }).subscribe("annotationUpdated", function (annotation) {
                _this.checkLoginState();
                _this.addReference(annotation);
            }).subscribe("annotationDeleted", function (annotation) {
                _this.checkLoginState();
                var index = $.inArray(annotation, _this.data);
                if( ~index )
                    _this.data.splice(index, 1);
            });

            _this.annotator.viewer.addField({
                load: _this.updateCreatorViewer
            });

            _this.annotator.viewer.addField({
                load: _this.updateLikeViewer
            });

            _this.annotator.viewer.addField({
                load: _this.updateDateViewer
            });
        }
    }
};

/**
 * Created by flyx on 8/21/15.
 */
/**
 * Created by flyx on 7/22/15.
 */
function Keyword(element, settings) {

    var _this = this;
    var _element = element;
    var keyword_index = 1;
    this.data = [];
    this.keywordUrl = 'http://140.109.18.158/api/annotation.jsp';

    function clone(obj) {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }


    this.init = function() {
        $.ajax(_this.keywordUrl , {
            method: 'POST',

            crossDomain: true,
            dataType: 'json',
            data :{
                text : $(element).html()
            },
            success: function(data) {

                for( i in data) {
                    var row = data[i];
                    $(_element).html(
                        $(_element)
                            .html()
                            .replace(new RegExp(row.keyword, "g"),
                            $('<div>').append(
                                $('<span/>').attr('id', 'keyword-' + row.id).addClass('annotator-hl').html(row.keyword)).html()
                        )
                    );
                }

                for ( var i in data) {
                    var row = data[i];

                    $('.annotator-hl').filter('#keyword-' + row.id).each(function(index) {

                            var obj = new function() {
                                return {
                                    "id": "keyword-" + keyword_index.toString(),  // unique id (added by backend)
                                    "text": row.description,                  // content of annotation
                                    "quote": row.description,    // the annotated text (added by frontend)
                                    "ranges": [                                // list of ranges covered by annotation (usually only one entry)
                                        {
                                            "start": "",           // (relative) XPath to start element
                                            "end": "",             // (relative) XPath to end element
                                            "startOffset": 0,                      // character offset within start element
                                            "endOffset": 0                       // character offset within end element
                                        }
                                    ],
                                    "user": {
                                        id: '0'
                                    },                           // user id of annotation owner (can also be an object with an 'id' property)
                                    "tags": [],             // list of tags (from Tags plugin)
                                    "permissions": {                           //annotation permissions (from Permissions/AnnotateItPermissions plugin)
                                        "read": [],
                                        "update": [0],
                                        "delete": [0]
                                    }
                                };
                            }();

                            $(this).addClass('hl-keywords').data('annotation',obj);
                            keyword_index++;
                        });
                }
            }
        });

    };
    this.init();
};

/**
 * Created by flyx on 7/6/15.
 */

function deleteCookie( name, path, domain ) {
    if( getCookie( name ) ) {
        document.cookie = name + "=" +
        ((path) ? ";path="+location.host:"")+
        ((domain)?";domain="+domain:"") +
        ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
    }
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";path=" + location.host +  "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

function getHashParam(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[&#]" + name + "=([^&#]*)"),
        results = regex.exec(location.hash);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var annotation = function(e) {

    this.server_host = '127.0.0.1';
    this.element = e;
    this.annotator = null;
    this.host = location.host;
    var _annotation = this;


    this.init = function(setting) {

        if( setting.uri == null ) {
            console.error('[Annotation Init Error]', 'uri undefined');
            return;
        }
        _annotation.uri = setting.uri

        // get Token from hash
        var anno_token = getHashParam('anno_token');
        // get user id from hash
        var user_id = parseInt(getHashParam('user_id'));

        if(isNaN(user_id))
            user_id = 0;

        var target_anno = parseInt(getHashParam('anno_id'));

        if(isNaN(target_anno))
            target_anno = 0;

        var old_anno_token = getCookie('anno_token');

        var old_user_id = getCookie('user_id');


        if( anno_token == '') {
            if (old_anno_token != "") {
                anno_token = old_anno_token;
            }
            if( old_user_id != "") {
                user_id = parseInt(old_user_id);
            }
        } else {
            setCookie('anno_token', anno_token, 30);
            setCookie('user_id', user_id, 30);
        }

        // init annotator
        this.annotator = $(_annotation.element).annotator();

        // set permission options
        var permissionsOptions = {};
        permissionsOptions['user'] = user_id;
        permissionsOptions['showEditPermissionsCheckbox'] = false;
        // set richText editor options
        var optionsRichText = {
            tinymce:{
                selector: "li.annotator-item textarea",
                plugins: "media image insertdatetime link code",
                menubar: false,
                toolbar_items_size: 'small',
                extended_valid_elements : "iframe[src|frameborder|style|scrolling|class|width|height|name|align|id]",
                toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media rubric | code "
            }
        };

        this.annotator
            .annotator('addPlugin', 'ImageAnnotation', {
                server : this.server_host
            })
            .annotator('addPlugin', 'ViewPanel', {
                target_anno : target_anno,
                anno_token : anno_token,
                uri: this.uri,
                server : this.server_host,
                domain : this.host
        }).annotator('addPlugin', 'Store', {
            prefix: '',
            urls: {
                create:  'http://' + this.server_host + '/api/annotations/',
                read:    'http://' + this.server_host + '/api/annotations/:id/',
                update:  'http://' + this.server_host + '/api/annotations/:id/',
                destroy: 'http://' + this.server_host + '/api/annotations/:id/',
                search:  'http://' + this.server_host + '/api/search/'
            },
            annotationData: {
                uri: this.uri,
                domain : this.host,
                anno_token : anno_token,
                likes: 0,
                link : location.href.split('#')[0]
            },
            loadFromSearch: {
                limit: 0,
                uri: uri,
                domain : this.host,
                anno_token : anno_token
            }
        })
            .annotator('addPlugin','RichText',optionsRichText)
            .annotator('addPlugin', 'Tags')
            .annotator('addPlugin', 'Permissions', permissionsOptions);

    };

    return this;
};

//# sourceMappingURL=annotation.full.js.map