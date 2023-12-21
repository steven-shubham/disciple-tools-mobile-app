import React from "react";
import { ScrollView, Text, View } from "react-native";
import OcticonsIcon from "react-native-vector-icons/Octicons";
import { SvgUri } from "react-native-svg";

import useStyles from "hooks/use-styles";
import useSettings from "hooks/use-settings";
import useTheme from "hooks/use-theme";

import { localStyles } from "./ArrowDefinitions.styles";

const TileName = ({ tileName }) => {
  const { isDarkMode } = useTheme();
  return (
    <View style={{ marginTop: 15 }}>
      <Text
        style={{
          fontSize: 22,
          fontWeight: "600",
          textDecorationLine: "underline",
          color: isDarkMode ? "white" : "black",
        }}
      >
        {tileName}
      </Text>
    </View>
  );
};

const FieldName = ({ fieldName }) => {
  const { isDarkMode } = useTheme();
  return (
    <View style={{ marginTop: 10 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "500",
          color: isDarkMode ? "white" : "black",
        }}
      >
        {fieldName}
      </Text>
    </View>
  );
};

const BulletInfoText = (props) => {
  const { isDarkMode } = useTheme();
  return (
    <View
      style={{
        marginLeft: 10,
        marginTop: 8,
        flexDirection: "row",
        alignItems: "flex-start",
      }}
    >
      <OcticonsIcon
        name="dot-fill"
        style={{
          marginRight: 10,
          marginTop: 4,
          color: isDarkMode ? "white" : "black",
        }}
      />
      <View style={{ width: "94%" }}>
        <Text>{props.children}</Text>
      </View>
    </View>
  );
};

const ArrowDefinitions = (props) => {
  const { styles, globalStyles } = useStyles(localStyles);
  const { settings } = useSettings();

  let renderIcons = () => {
    const iconsData =
      settings?.["post_types"]?.["groups"]?.fields?.health_metrics?.default ||
      {};
    let iconsDataArray = [];

    // console.log("--iconsData--", iconsData);

    // MAKING AN ARRAY OF OBJECTS FROM AN OBJECT OF OBJECTS
    for (let [key, value] of Object.entries(iconsData || {})) {
      if (value.icon !== "") {
        iconsDataArray.push({ key, value });
      }
    }

    let totalIcons = iconsDataArray.length;
    let svgIconsArray = [];

    for (let i = 0; i < totalIcons; i++) {
      let tempComp = (
        <View
          style={styles.churchHealthIconContainer}
          key={iconsDataArray[i].value.description}
        >
          <SvgUri width={40} height={40} uri={iconsDataArray[i].value.icon} />
          <View style={styles.churchHealthIconDescriptionContainer}>
            <Text>
              <Text style={styles.bulletTextBold}>
                {iconsDataArray[i].value.label} -
              </Text>
              {iconsDataArray[i].value.description}
            </Text>
          </View>
        </View>
      );
      svgIconsArray.push(tempComp);
    }
    return svgIconsArray;
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* For Groups */}
      <View style={styles.postTypeContainer}>
        <Text style={styles.postTypeText}>GROUPS</Text>
      </View>
      <TileName tileName="Status" />
      <FieldName fieldName="Group Status" />
      <Text>Set the current status of the group.</Text>
      <BulletInfoText>
        <Text>Active - The group is actively meeting.</Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text>Inactive - The group is no longer meeting.</Text>
      </BulletInfoText>
      <FieldName fieldName="Assigned To" />
      <Text>
        Select the main person who is responsible for reporting on this group.
      </Text>
      <FieldName fieldName="Group Coach / Church Planter" />
      <Text>
        The person who planted and/or is coaching this group. Only one person
        can be assigned to a group while multiple people can be coaches / church
        planters of this group.
      </Text>

      <TileName tileName="Details" />
      <FieldName fieldName="Start Date" />
      <Text>The date this group began meeting.</Text>
      <FieldName fieldName="Church Start Date" />
      <Text>The date this group first identified as being a church.</Text>
      <FieldName fieldName="End Date" />
      <Text>The date this group stopped meeting (if applicable).</Text>
      <FieldName fieldName="Locations" />
      <Text>The general location where this contact is located.</Text>
      <FieldName fieldName="People Groups" />
      <Text>The people groups represented by this group.</Text>

      <TileName tileName="Other" />
      <FieldName fieldName="Tags" />
      <Text>A useful way to group related items.</Text>
      <FieldName fieldName="Influence" />
      <Text>
        Indicate the approximate, estimated level of influence my team had in a
        Group moving to its current status.
      </Text>
      <FieldName fieldName="Partner Involvement" />
      <Text>
        Select the statement that best describes the involvement of others:
      </Text>
      <BulletInfoText>
        <Text>
          A. - No partners available: No other ministries or churches are
          working among this people group in this location.
        </Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text>
          B. – Working with partners: You are working in partnership with other
          ministries or churches among this people group in this location.
        </Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text>
          C. – Working separately: You and other ministries or churches are
          working separately among this people group in this location.
        </Text>
      </BulletInfoText>
      <FieldName fieldName="Least Reached Category" />
      <Text>
        Select the statement that best describes the involvement of others:
      </Text>
      <BulletInfoText>
        <Text>
          A. - No witness; No response: There has been no gospel engagement. No
          one is living, proclaiming and demonstrating the gospel among them,
          nor has there been a positive response to God’s grace in all its
          truth.
        </Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text>
          B. – Witness but No Community: There has been gospel engagement, but
          no gospel-centred and gospel-proclaiming community of Jesus followers
          is present.
        </Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text>
          C. – Community but Isolated: There is a community of Jesus followers
          living, proclaiming and demonstrating the gospel but, due to
          geographical distance, cultural barriers or linguistic obstacles,
          access to it is significantly limited for the vast majority of that
          people or community.
        </Text>
      </BulletInfoText>

      <TileName tileName="Member List" />
      <FieldName fieldName="Member Count" />
      <Text>
        The number of members in this group. It will automatically be updated
        when new members are added or removed in the member list. Change this
        number manually to include people who may not be in the system but are
        also members of the group.
      </Text>

      <TileName tileName="Church Health" />
      <FieldName fieldName="Church Health" />
      <Text>Track the progress and health of a group/church.</Text>
      <View>{renderIcons()}</View>
      <FieldName fieldName="Baptism Ratio" />
      <Text>
        Reflects the total Member Count, split between baptized and unbaptized
        Contacts. Shown above the water line is the number of unbaptized
        Contacts. Shown below the water line is the number of baptized Contacts.
        Quantities manually entered in the Member Count field will be added to
        the unbaptized Contact count above the water line.
      </Text>

      <TileName tileName="Groups" />
      <FieldName fieldName="Group Type" />
      <BulletInfoText>
        <Text style={styles.bulletTextBold}>Small Group - </Text>
        <Text>
          A group that is meeting around the Word of God in some way. They may
          be seekers and not believers.
        </Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text style={styles.bulletTextBold}>Body of Christ Group - </Text>
        <Text>
          This is a group that is considered to be a local expression of the
          Body of Christ. At a minimum, this includes some believers. They meet
          regularly to engage in some kind of Bible study/teaching together. It
          is not usually a cell group of an existing church and it has the
          potential to become a VCJF (Vibrant Community of Jesus Followers).
        </Text>
      </BulletInfoText>
      <FieldName fieldName="Parent Group" />
      <Text>A group that founded this group.</Text>
      <FieldName fieldName="Peer Group" />
      <Text>
        A related group that isn't a parent/child in relationship. It might
        indicate groups that collaborate, are about to merge, recently split,
        etc.
      </Text>
      <FieldName fieldName="Child Group" />
      <Text>A group that has been birthed out of this group.</Text>

      {/* For Contacts */}
      <View style={styles.postTypeContainer}>
        <Text style={styles.postTypeText}>CONTACTS</Text>
      </View>
      <TileName tileName="Status" />
      <FieldName fieldName="Contact Status" />
      <Text>
        The Contact Status describes the progress in communicating with the
        contact.
      </Text>
      <BulletInfoText>
        <Text style={styles.bulletTextBold}>New Contact - </Text>
        <Text> The contact is new in the system.</Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text style={styles.bulletTextBold}>Not Ready - </Text>
        <Text>
          There is not enough information to move forward with the contact at
          this time.
        </Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text style={styles.bulletTextBold}>Dispatch Needed - </Text>
        <Text> This contact needs to be assigned to a multiplier.</Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text style={styles.bulletTextBold}>Waiting to be accepted - </Text>
        <Text>
          The contact has been assigned to someone, but has not yet been
          accepted by that person.
        </Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text style={styles.bulletTextBold}>Active - </Text>
        <Text>
          The contact is progressing and/or continually being updated.
        </Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text style={styles.bulletTextBold}>Paused - </Text>
        <Text>
          This contact is currently on hold (i.e. on vacation or not
          responding).
        </Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text style={styles.bulletTextBold}>Archived - </Text>
        <Text>
          This contact has made it known that they no longer want to continue or
          you have decided not to continue with him/her.
        </Text>
      </BulletInfoText>
      <FieldName fieldName="Assigned To" />
      <Text>
        Select the main person who is responsible for reporting on this contact.
      </Text>
      <FieldName fieldName="Sub-assigned to" />
      <Text>
        Contact or User assisting the Assigned To user to follow up with the
        contact.
      </Text>
      <FieldName fieldName="Faith Status" />
      <BulletInfoText>
        <Text style={styles.bulletTextBold}>Seeker</Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text style={styles.bulletTextBold}>Believer</Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text style={styles.bulletTextBold}>Leader</Text>
      </BulletInfoText>
      <FieldName fieldName="Coached by" />
      <Text>Who is coaching this contact.</Text>

      <TileName tileName="Details" />
      <FieldName fieldName="Locations" />
      <Text>The general location where this contact is located.</Text>
      <FieldName fieldName="Gender" />
      <BulletInfoText>
        <Text>Male</Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text>Female</Text>
      </BulletInfoText>
      <FieldName fieldName="Age" />
      <BulletInfoText>
        <Text>Under 18 years old</Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text>18-25 years old</Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text>26-40 years old</Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text>Over 40 years old</Text>
      </BulletInfoText>
      <FieldName fieldName="People Groups" />
      <Text>The people groups represented by this contact.</Text>
      <FieldName fieldName="Sources" />
      <Text>The website, event or location this contact came from.</Text>
      <BulletInfoText>
        <Text>Personal</Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text>Web</Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text>Facebook</Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text>Twitter</Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text>
          Transfer - Contacts transferred from a partnership with another
          Disciple.Tools site.
        </Text>
      </BulletInfoText>
      <FieldName fieldName="Campaigns" />
      <Text>
        Marketing campaigns or access activities that this contact interacted
        with.
      </Text>

      <TileName tileName="Other" />
      <FieldName fieldName="Tags" />
      <Text>A useful way to group related items.</Text>
      <FieldName fieldName="Connections to other Contacts" />
      <Text>
        Relationship this contact has with another contact in the system.
      </Text>
      <FieldName fieldName="Is Coaching" />
      <Text>Who is this contact coaching.</Text>
      <FieldName fieldName="Groups" />
      <Text>Groups this contact is a member of.</Text>

      <TileName tileName="Faith" />
      <FieldName fieldName="Faith Milestones" />
      <Text>
        Assign which milestones the contact has reached in their faith journey.
        These are points in a contact’s spiritual journey worth celebrating but
        can happen in any order.
      </Text>
      <BulletInfoText>
        <Text>Has Bible</Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text>Reading Bible</Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text>States Belief</Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text>Can Share Gospel/Testimony</Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text>Sharing Gospel/Testimony</Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text>Baptized</Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text>Baptizing</Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text>In Church/Group</Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text>Starting Churches</Text>
      </BulletInfoText>
      <FieldName fieldName="Baptized by" />
      <Text>Who baptized this contact.</Text>
      <FieldName fieldName="Baptized" />
      <Text>Who this contact has baptized.</Text>

      <TileName tileName="Follow Up" />
      <FieldName fieldName="Seeker Path" />
      <Text>
        Set the status of your progression with the contact. These are the steps
        that happen in a specific order to help a contact move forward.
      </Text>
      <BulletInfoText>
        <Text>Contact Attempt Needed</Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text>Contact Attempted</Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text>Contact Established</Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text>First Meeting Scheduled</Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text>First Meeting Complete</Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text>Ongoing Meetings</Text>
      </BulletInfoText>
      <BulletInfoText>
        <Text>Being Coached</Text>
      </BulletInfoText>
    </ScrollView>
  );
};

export default ArrowDefinitions;
